module Bonobo

using DataStructures
using NamedTupleTools

"""
    AbstractNode

The abstract type for a tree node. Your own type for `Node` given to [`initialize`](@ref) needs to subtype it.
The default if you don't provide your own is [`DefaultNode`](@ref).
"""
abstract type AbstractNode end

"""
    AbstractSolution{Node<:AbstractNode, Value}

The abstract type for a `Solution` object. The default is [`DefaultSolution`](@ref).
It is parameterized by `Node` and `Value` where `Value` is the value which describes the full solution i.e the value for every variable.
"""
abstract type AbstractSolution{Node<:AbstractNode, Value} end

"""
    BnBNode

Holds the necessary information of every node.
This needs to be added by every `AbstractNode` as `std::BnBNode`

```julia
id :: Int
lb :: Float64 
ub :: Float64
```
"""
mutable struct BnBNode
    id :: Int
    lb :: Float64 
    ub :: Float64
end

"""
    DefaultNode <: AbstractNode

The default structure for saving node information. 
Currently this includes only the necessary `std::BnBNode` which needs to be part of every [`AbstractNode`](@ref).
"""
mutable struct DefaultNode <: AbstractNode
    std :: BnBNode
end

"""
    DefaultSolution{Node<:AbstractNode,Value} <: AbstractSolution{Node, Value}

The default struct to save a solution of the branch and bound run.
It holds 
```julia
objective :: Float64
solution  :: Value 
node      :: Node
```
Both the `Value` and the `Node` type are determined by the [`initialize`](@ref) method.

`solution` holds the information to obtain the solution for example the values of all variables. 
"""
mutable struct DefaultSolution{Node<:AbstractNode,Value} <: AbstractSolution{Node, Value}
    objective :: Float64
    solution  :: Value
    node      :: Node
end

"""
    AbstractTraverseStrategy

The abstract type for a traverse strategy. 
If you implement a new traverse strategy this must be the supertype. 

If you want to implement your own strategy the [`get_next_node`](@ref) function needs a new method 
which dispatches on the `traverse_strategy` argument. 
"""
abstract type AbstractTraverseStrategy end


"""
    AbstractBranchStrategy

The abstract type for a branching strategy. 
If you implement a new branching strategy, this must be the supertype. 

If you want to implement your own strategy, you must implement a new method for [`get_branching_variable`](@ref)
which dispatches on the `branch_strategy` argument. 
"""
abstract type AbstractBranchStrategy end

"""
    BFS <: AbstractTraverseStrategy

The BFS traverse strategy always picks the node with the lowest bound first.
If there is a tie then the smallest node id is used as a tie breaker.
"""
struct BFS <: AbstractTraverseStrategy end

"""
    FIRST <: AbstractBranchStrategy

The `FIRST` strategy always picks the first variable which isn't fixed yet and can be branched on.
"""
struct FIRST <: AbstractBranchStrategy end

"""
    MOST_INFEASIBLE <: AbstractBranchStrategy

The `MOST_INFEASIBLE` strategy always picks the variable which is furthest away from being "fixed" and can be branched on.
"""
struct MOST_INFEASIBLE <: AbstractBranchStrategy end

mutable struct Options
    traverse_strategy   :: AbstractTraverseStrategy
    branch_strategy     :: AbstractBranchStrategy
    atol                :: Float64
    rtol                :: Float64
end

"""
    BnBTree{Node<:AbstractNode,Root,Value,Solution<:AbstractSolution{Node,Value}}

Holds all the information of the branch and bound tree. 
"""
mutable struct BnBTree{Node<:AbstractNode,Root,Value,Solution<:AbstractSolution{Node,Value}}
    incumbent::Float64
    lb::Float64
    solutions::Vector{Solution}
    nodes::PriorityQueue{Int,Node}
    root::Root
    branching_indices::Vector{Int}
    num_nodes::Int
    sense::Symbol
    options::Options
end
Base.broadcastable(x::BnBTree) = Ref(x)

include("util.jl")
include("node.jl")
include("branching.jl")

"""
    initialize(; kwargs...)

Initialize the branch and bound framework with the the following arguments.
Later it can be dispatched on `BnBTree{Node, Root, Solution}` for various methods.

# Keyword arguments
- `traverse_strategy` [`BFS`] currently the only supported traverse strategy is [`BFS`](@ref). Should be an [`AbstractTraverseStrategy`](@ref)
- `branch_strategy` [`FIRST`] currently the only supported branching strategies are [`FIRST`](@ref) and [`MOST_INFEASIBLE`](@ref). Should be an [`AbstractBranchStrategy`](@ref)
- `atol` [1e-6] the absolute tolerance to check whether a value is discrete
- `rtol` [1e-6] the relative tolerance to check whether a value is discrete
- `Node` [`DefaultNode`](@ref) can be special structure which is used to store all information about a node. 
    - needs to have `AbstractNode` as the super type
    - needs to have `std :: BnBNode` as a field (see [`BnBNode`](@ref))
- `Solution` [`DefaultSolution`](@ref) stores the node and several other information about a solution
- `root` [`nothing`] the information about the root problem. The type can be used for dispatching on types 
- `sense` [`:Min`] can be `:Min` or `:Max` depending on the objective sense
- `Value` [`Vector{Float64}`] the type of a solution  

Return a [`BnBTree`](@ref) object which is the input for [`optimize!`](@ref).
"""
function initialize(;
    traverse_strategy = BFS,
    branch_strategy = FIRST,
    atol = 1e-6,
    rtol = 1e-6,
    Node = DefaultNode,
    Value = Vector{Float64},
    Solution = DefaultSolution{Node,Value},
    root = nothing,
    sense = :Min,
)
    return BnBTree{Node,typeof(root),Value,Solution}(
        NaN, 
        NaN,
        Vector{Solution}(),
        PriorityQueue{Int,Node}(),
        root,
        get_branching_indices(root),
        0,
        sense,
        Options(traverse_strategy(), branch_strategy(), atol, rtol)
    )
end

function get_branching_indices end

"""
    optimize!(tree::BnBTree)

Optimize the problem using a branch and bound approach. 

The steps are the following:
```julia
while !terminated(tree) # as long as there are open nodes
    # get the next open node depending on the traverse strategy
    node = get_next_node(tree, tree.options.traverse_strategy) 
    # needs to be implemented by you
    # Should evaluate the current node and return the lower and upper bound
    # if the problem is infeasible both values should be set to NaN
    lb, ub = evaluate_node!(tree, node) 
    # updates the upper and lower bound of the node struct
    set_node_bound!(tree.sense, node, lb, ub)

    # update the best solution 
    updated = update_best_solution!(tree, node)
    updated && bound!(tree, node.id)
    
    # remove the current node
    close_node!(tree, node)
    # needs to be implemented by you
    # calls get_branching_variable and branch_on_variable! the latter must be implemented by you
    branch!(tree, node)
end
```

every function of the above can be overriden by your own method. 
"""
function optimize!(tree::BnBTree)
    while !terminated(tree)
        node = get_next_node(tree, tree.options.traverse_strategy)
        lb, ub = evaluate_node!(tree, node) 
        # if the problem was infeasible we simply close the node and continue
        if isnan(lb) && isnan(ub)
            close_node!(tree, node)
            continue
        end

        set_node_bound!(tree.sense, node, lb, ub)

        updated = update_best_solution!(tree, node)
        updated && bound!(tree, node.id)

        close_node!(tree, node)
        branch!(tree, node)
    end
end

"""
    terminated(tree::BnBTree)

Return true when the branch and bound loop in [`optimize!`](@ref) should be terminated.
Default behavior is to terminate the loop only when no nodes exist in the priority queue.
"""
terminated(tree::BnBTree) = isempty(tree.nodes)

"""
    set_node_bound!(objective_sense::Symbol, node::AbstractNode, lb, ub)

Set the bounds of the `node` object to the lower and upper bound given. 
Internally everything is stored as a minimization problem. Therefore the objective_sense `:Min`/`:Max` is needed.
"""
function set_node_bound!(objective_sense::Symbol, node::AbstractNode, lb, ub)
    if isnan(ub)
        ub = Inf
    end
    if objective_sense == :Min
        node.lb = lb
        node.ub = ub
    else
        node.lb = -lb
        node.ub = -ub
    end
end

"""
    bound!(tree::BnBTree, current_node_id)

Close all nodes which have a lower bound higher or equal to the incumbent
"""
function bound!(tree::BnBTree, current_node_id)
    for (_,node) in tree.nodes
        if node.id != current_node_id && node.lb >= tree.incumbent
            close_node!(tree, node)
        end
    end
end

"""
    close_node!(tree::BnBTree, node::AbstractNode)

Delete the node from the priority queue from the nodes
"""
close_node!(tree::BnBTree, node::AbstractNode) = delete!(tree.nodes, node.id)

"""
    update_best_solution!(tree::BnBTree, node::AbstractNode)

Update the best solution when we found a better incumbent.
Calls [`add_new_solution!`] if this is the case
"""
function update_best_solution!(tree::BnBTree, node::AbstractNode)
    isinf(node.ub) && return false
    node.ub >= tree.incumbent && return false

    tree.incumbent = node.ub

    add_new_solution!(tree, node)
    return true
end

"""
    add_new_solution!(tree::BnBTree{N,R,V,S}, node::AbstractNode) where {N,R,V,S<:DefaultSolution{N,V}}

Currently it changes the general solution itself by calling [`get_relaxed_values`](@ref) which needs to be implemented by you.
# Todo: Add a possibility to store several solutions based on some options.

This function needs to be implemented by you if you have a different type of Solution object than [`DefaultSolution`](@ref).
"""
function add_new_solution!(tree::BnBTree{N,R,V,S}, node::AbstractNode) where {N,R,V,S<:DefaultSolution{N,V}}
    sol = DefaultSolution(node.ub, get_relaxed_values(tree, node), node)
    if isempty(tree.solutions)
        push!(tree.solutions, sol)
    else
        tree.solutions[1] = sol
    end
end

"""
    get_relaxed_values(tree::BnBTree, node::AbstractNode)

Get the values of the current node. This is always called only after [`evaluate_node!`](@ref) is called.
It is used to store a `Solution` object.
Return the type of `Value` given to the [`initialize`](@ref) method.
"""
function get_relaxed_values end

"""
    get_solution(tree::BnBTree; result=1)

Return the solution values of the problem. 
See [`get_objective_value`](@ref) to obtain the objective value instead.
"""
function get_solution(tree::BnBTree{N,R,V,S}; result=1) where {N,R,V,S<:DefaultSolution{N,V}}
    return tree.solutions[result].solution
end

"""
    get_objective_value(tree::BnBTree; result=1)

Return the objective value
"""
function get_objective_value(tree::BnBTree{N,R,V,S}; result=1) where {N,R,V,S<:DefaultSolution{N,V}}
    if tree.sense == :Max
        return -tree.solutions[result].objective
    else
        return tree.solutions[result].objective
    end
end

export BnBTree, BnBNode, AbstractNode, AbstractSolution

export AbstractTraverseStrategy

end
