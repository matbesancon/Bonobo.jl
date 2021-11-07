var documenterSearchIndex = {"docs":
[{"location":"reference/#Reference","page":"Reference","title":"Reference","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"CurrentModule = Bonobo","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Modules = [Bonobo]","category":"page"},{"location":"reference/#Bonobo.AbstractBranchStrategy","page":"Reference","title":"Bonobo.AbstractBranchStrategy","text":"AbstractBranchStrategy\n\nThe abstract type for a branching strategy.  If you implement a new branching strategy, this must be the supertype. \n\nIf you want to implement your own strategy, you must implement a new method for get_branching_variable which dispatches on the branch_strategy argument. \n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.AbstractNode","page":"Reference","title":"Bonobo.AbstractNode","text":"AbstractNode\n\nThe abstract type for a tree node. Your own type for Node given to initialize needs to subtype it. The default if you don't provide your own is DefaultNode.\n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.AbstractSolution","page":"Reference","title":"Bonobo.AbstractSolution","text":"AbstractSolution{Node<:AbstractNode, Value}\n\nThe abstract type for a Solution object. The default is DefaultSolution. It is parameterized by Node and Value where Value is the value which describes the full solution i.e the value for every variable.\n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.AbstractTraverseStrategy","page":"Reference","title":"Bonobo.AbstractTraverseStrategy","text":"AbstractTraverseStrategy\n\nThe abstract type for a traverse strategy.  If you implement a new traverse strategy this must be the supertype. \n\nIf you want to implement your own strategy the get_next_node function needs a new method  which dispatches on the traverse_strategy argument. \n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.BFS","page":"Reference","title":"Bonobo.BFS","text":"BFS <: AbstractTraverseStrategy\n\nThe BFS traverse strategy always picks the node with the lowest bound first. If there is a tie then the smallest node id is used as a tie breaker.\n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.BnBNode","page":"Reference","title":"Bonobo.BnBNode","text":"BnBNode\n\nHolds the necessary information of every node. This needs to be added by every AbstractNode as std::BnBNode\n\nid :: Int\nlb :: Float64 \nub :: Float64\n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.BnBTree","page":"Reference","title":"Bonobo.BnBTree","text":"BnBTree{Node<:AbstractNode,Root,Value,Solution<:AbstractSolution{Node,Value}}\n\nHolds all the information of the branch and bound tree. \n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.DefaultNode","page":"Reference","title":"Bonobo.DefaultNode","text":"DefaultNode <: AbstractNode\n\nThe default structure for saving node information.  Currently this includes only the necessary std::BnBNode which needs to be part of every AbstractNode.\n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.DefaultSolution","page":"Reference","title":"Bonobo.DefaultSolution","text":"DefaultSolution{Node<:AbstractNode,Value} <: AbstractSolution{Node, Value}\n\nThe default struct to save a solution of the branch and bound run. It holds \n\nobjective :: Float64\nsolution  :: Value \nnode      :: Node\n\nBoth the Value and the Node type are determined by the initialize method.\n\nsolution holds the information to obtain the solution for example the values of all variables. \n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.FIRST","page":"Reference","title":"Bonobo.FIRST","text":"FIRST <: AbstractBranchStrategy\n\nThe FIRST strategy always picks the first variable with a fractional solution to branch on.\n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.MOST_INFEASIBLE","page":"Reference","title":"Bonobo.MOST_INFEASIBLE","text":"MOST_INFEASIBLE <: AbstractBranchStrategy\n\nThe MOST_INFEASIBLE strategy always picks the variable which is furthest away from being discrete.\n\n\n\n\n\n","category":"type"},{"location":"reference/#Bonobo.add_new_solution!-Union{Tuple{S}, Tuple{V}, Tuple{R}, Tuple{N}, Tuple{BnBTree{N, R, V, S}, AbstractNode}} where {N, R, V, S<:Bonobo.DefaultSolution{N, V}}","page":"Reference","title":"Bonobo.add_new_solution!","text":"add_new_solution!(tree::BnBTree{N,R,V,S}, node::AbstractNode) where {N,R,V,S<:DefaultSolution{N,V}}\n\nCurrently it changes the general solution itself by calling get_relaxed_values which needs to be implemented by you.\n\nTodo: Add a possibility to store several solutions based on some options.\n\nThis function needs to be implemented by you if you have a different type of Solution object than DefaultSolution.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.add_node!-Union{Tuple{Node}, Tuple{BnBTree{Node, Root, Value, Solution} where {Root, Value, Solution<:AbstractSolution{Node, Value}}, NamedTuple}} where Node<:AbstractNode","page":"Reference","title":"Bonobo.add_node!","text":"add_node!(tree::BnBTree{Node}, node_info::NamedTuple)\n\nAdd a new node to the tree using the node_info. For information on that see set_root!.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.bound!-Tuple{BnBTree, Any}","page":"Reference","title":"Bonobo.bound!","text":"bound!(tree::BnBTree, current_node_id)\n\nClose all nodes which have a lower bound higher or equal to the incumbent\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.branch!-Tuple{Any, Any}","page":"Reference","title":"Bonobo.branch!","text":"branch!(tree, node)\n\nGet the branching variable with get_branching_variable and then calls get_branching_nodes_info and add_node!.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.close_node!-Tuple{BnBTree, AbstractNode}","page":"Reference","title":"Bonobo.close_node!","text":"close_node!(tree::BnBTree, node::AbstractNode)\n\nDelete the node from the priority queue from the nodes\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.create_node-Tuple{Any, Int64, NamedTuple}","page":"Reference","title":"Bonobo.create_node","text":"create_node(Node, node_id::Int, node_info::NamedTuple)\n\nCreates a node of type Node with id node_id and the named tuple node_info.  For information on that see set_root!.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.evaluate_node!","page":"Reference","title":"Bonobo.evaluate_node!","text":"evaluate_node!(tree, node)\n\nEvaluate the current node and return the lower and upper bound of that node.\n\n\n\n\n\n","category":"function"},{"location":"reference/#Bonobo.get_branching_nodes_info","page":"Reference","title":"Bonobo.get_branching_nodes_info","text":"get_branching_nodes_info(tree::BnBTree, node::AbstractNode, vidx::Int)\n\nCreate the information for new branching nodes based on the variable index vidx. Return a list of those information as a NamedTuple vector.\n\nExample\n\nThe following would add the necessary information about a new node and return it. The necessary information are the fields required by the AbstractNode. For this examle the required fields are the lower and upper bounds of the variables as well as the status of the node.\n\nnodes_info = NamedTuple[]\npush!(nodes_info, (\n    lbs = lbs,\n    ubs = ubs,\n    status = MOI.OPTIMIZE_NOT_CALLED,\n))\nreturn nodes_info\n\n\n\n\n\n","category":"function"},{"location":"reference/#Bonobo.get_branching_variable-Tuple{BnBTree, Bonobo.FIRST, AbstractNode}","page":"Reference","title":"Bonobo.get_branching_variable","text":"get_branching_variable(tree::BnBTree, ::FIRST, node::AbstractNode)\n\nReturn the first possible branching variable which should be discrete based on tree.discrete_indices and is currently not discrete based on is_approx_discrete. Return -1 if all integer constraints are respected.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.get_branching_variable-Tuple{BnBTree, Bonobo.MOST_INFEASIBLE, AbstractNode}","page":"Reference","title":"Bonobo.get_branching_variable","text":"get_branching_variable(tree::BnBTree, ::MOST_INFEASIBLE, node::AbstractNode)\n\nReturn the branching variable which is furthest away from being discrete or -1 if all integer constraints are respected.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.get_next_node-Tuple{BnBTree, Bonobo.BFS}","page":"Reference","title":"Bonobo.get_next_node","text":"get_next_node(tree::BnBTree, travese_strategy::BFS)\n\nGet the next node of the tree which shall be evaluted next by evaluate_node!. If you want to implement your own traversing strategy check out AbstractTraverseStrategy.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.get_objective_value-Union{Tuple{BnBTree{N, R, V, S}}, Tuple{S}, Tuple{V}, Tuple{R}, Tuple{N}} where {N, R, V, S<:Bonobo.DefaultSolution{N, V}}","page":"Reference","title":"Bonobo.get_objective_value","text":"get_objective_value(tree::BnBTree; result=1)\n\nReturn the objective value\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.get_relaxed_values","page":"Reference","title":"Bonobo.get_relaxed_values","text":"get_relaxed_values(tree::BnBTree, node::AbstractNode)\n\nGet the values of the current node. This is always called only after evaluate_node! is called. It is used to store a Solution object. Return the type of Value given to the initialize method.\n\n\n\n\n\n","category":"function"},{"location":"reference/#Bonobo.get_solution-Union{Tuple{BnBTree{N, R, V, S}}, Tuple{S}, Tuple{V}, Tuple{R}, Tuple{N}} where {N, R, V, S<:Bonobo.DefaultSolution{N, V}}","page":"Reference","title":"Bonobo.get_solution","text":"get_solution(tree::BnBTree; result=1)\n\nReturn the solution values of the problem.  See get_objective_value to obtain the objective value instead.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.initialize-Tuple{}","page":"Reference","title":"Bonobo.initialize","text":"initialize(; kwargs...)\n\nInitialize the branch and bound framework with the the following arguments. Later it can be dispatched on BnBTree{Node, Root, Solution} for various methods.\n\nKeyword arguments\n\ntraverse_strategy [BFS] currently the only supported traverse strategy is BFS. Should be an AbstractTraverseStrategy\nbranch_strategy [FIRST] currently the only supported branching strategies are FIRST and MOST_INFEASIBLE. Should be an AbstractBranchStrategy\natol [1e-6] the absolute tolerance to check whether a value is discrete\nrtol [1e-6] the relative tolerance to check whether a value is discrete\nNode DefaultNode can be special structure which is used to store all information about a node. \nneeds to have AbstractNode as the super type\nneeds to have std :: BnBNode as a field (see BnBNode)\nSolution DefaultSolution stores the node and several other information about a solution\nroot [nothing] the information about the root problem. The type can be used for dispatching on types \nsense [:Min] can be :Min or :Max depending on the objective sense\nValue [Vector{Float64}] the type of a solution  \n\nReturn a BnBTree object which is the input for optimize!.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.is_approx_discrete-Tuple{BnBTree, Any}","page":"Reference","title":"Bonobo.is_approx_discrete","text":"is_approx_discrete(tree::BnBTree, value)\n\nReturn whether a given value is approximately discrete based on the tolerances defined in the tree options. \n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.optimize!-Tuple{BnBTree}","page":"Reference","title":"Bonobo.optimize!","text":"optimize!(tree::BnBTree)\n\nOptimize the problem using a branch and bound approach. \n\nThe steps are the following:\n\nwhile !terminated(tree) # as long as there are open nodes\n    # get the next open node depending on the traverse strategy\n    node = get_next_node(tree, tree.options.traverse_strategy) \n    # needs to be implemented by you\n    # Should evaluate the current node and return the lower and upper bound\n    # if the problem is infeasible both values should be set to NaN\n    lb, ub = evaluate_node!(tree, node) \n    # updates the upper and lower bound of the node struct\n    set_node_bound!(tree.sense, node, lb, ub)\n\n    # update the best solution \n    updated = update_best_solution!(tree, node)\n    updated && bound!(tree, node.id)\n    \n    # remove the current node\n    close_node!(tree, node)\n    # needs to be implemented by you\n    # calls get_branching_variable and branch_on_variable! the latter must be implemented by you\n    branch!(tree, node)\nend\n\nevery function of the above can be overriden by your own method. \n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.set_node_bound!-Tuple{Symbol, AbstractNode, Any, Any}","page":"Reference","title":"Bonobo.set_node_bound!","text":"set_node_bound!(objective_sense::Symbol, node::AbstractNode, lb, ub)\n\nSet the bounds of the node object to the lower and upper bound given.  Internally everything is stored as a minimization problem. Therefore the objective_sense :Min/:Max is needed.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.set_root!-Tuple{BnBTree, NamedTuple}","page":"Reference","title":"Bonobo.set_root!","text":"set_root!(tree::BnBTree, node_info::NamedTuple)\n\nSet the root node information based on the node_info which needs to include the same fields as the Node struct given  to the initialize method. (Besides the std field which is set by Bonobo automatically)\n\nExample\n\nIf your node structure is the following:\n\nmutable struct MIPNode <: AbstractNode\n    std :: BnBNode\n    lbs :: Vector{Float64}\n    ubs :: Vector{Float64}\n    status :: MOI.TerminationStatusCode\nend\n\nthen you can call the function with this syntax:\n\nBonobo.set_root!(tree, (\n    lbs = fill(-Inf, length(x)),\n    ubs = fill(Inf, length(x)),\n    status = MOI.OPTIMIZE_NOT_CALLED\n))\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.terminated-Tuple{BnBTree}","page":"Reference","title":"Bonobo.terminated","text":"terminated(tree::BnBTree)\n\nReturn true when the branch and bound loop in optimize! should be terminated. Default behavior is to terminate the loop only when no nodes exist in the priority queue.\n\n\n\n\n\n","category":"method"},{"location":"reference/#Bonobo.update_best_solution!-Tuple{BnBTree, AbstractNode}","page":"Reference","title":"Bonobo.update_best_solution!","text":"update_best_solution!(tree::BnBTree, node::AbstractNode)\n\nUpdate the best solution when we found a better incumbent. Calls [add_new_solution!] if this is the case\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = Bonobo","category":"page"},{"location":"#Bonobo","page":"Home","title":"Bonobo","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Bonobo is a general branch and bound framework at a very early stage.  The idea is to make it very customizable and provide useful methods regarding branching strategies and cuts. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"The following three functions need to be implemented to start the process.","category":"page"},{"location":"","page":"Home","title":"Home","text":"initialize (Bonobo.initalize(; kwargs...))\nFor initializing the BnBTree structure itself with the model information and setting options like the traverse and branch strategy.\nIt returns the created BnBTree object which I'll call tree.\nset_root! (Bonobo.set_root!(tree, node_info::NamedTuple))\nSetting the information for the root node which will be evaluated first with evaluate_node!\noptimize! (Bonobo.optimize!(tree))\nThe optimization function calls several branch and bound functions in a loop. Check the docstring for detailed information.","category":"page"},{"location":"","page":"Home","title":"Home","text":"A couple of methods need to be implemented by you to apply it to your need.  When you call the above methods some warnings might pop up in the terminal which specify which functions need to be implemented by you.","category":"page"},{"location":"how_to/#How-To-Guide","page":"How-To","title":"How-To Guide","text":"","category":"section"},{"location":"tutorial/#Tutorial","page":"Tutorial","title":"Tutorial","text":"","category":"section"}]
}
