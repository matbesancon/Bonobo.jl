
mutable struct MIPNode <: AbstractNode
    std :: BnBNode
    lbs :: Vector{Float64}
    ubs :: Vector{Float64}
    status :: MOI.TerminationStatusCode
end

BB.get_relaxed_values(tree::BnBTree{MIPNode, JuMP.Model}, node::MIPNode) = value.(tree.root[:x])

function BB.evaluate_node!(tree::BnBTree{MIPNode, JuMP.Model}, node::MIPNode)
    m = tree.root
    JuMP.set_lower_bound.(m[:x], node.lbs)
    JuMP.set_upper_bound.(m[:x], node.ubs)

    optimize!(m)
    status = termination_status(m)
    node.status = status
    if status != MOI.OPTIMAL
        return NaN,NaN
    end

    obj_val = objective_value(m)
    if all(isapprox_discrete.(value.(m[:x])))
        node.ub = obj_val
        return obj_val, obj_val
    end
    return obj_val, NaN
end

function BB.branch!(tree::BnBTree{MIPNode, JuMP.Model}, node::MIPNode)
    !isinf(node.ub) && return
    node.status != MOI.OPTIMAL && return 
    m = tree.root
    # first variable which is not discrete

    lbs = copy(node.lbs)
    ubs = copy(node.ubs)

    vx = value.(m[:x])
    for (i,x) in enumerate(vx)
        if !isapprox_discrete(x)
            # left child set upper bound
            ubs[i] = floor(Int, x)

            BB.add_node!(tree, (
                lbs = copy(node.lbs),
                ubs = ubs,
                status = MOI.OPTIMIZE_NOT_CALLED,
            ))

            # left child set upper bound
            lbs[i] = ceil(Int, x)

            BB.add_node!(tree, (
                lbs = lbs,
                ubs = copy(node.ubs),
                status = MOI.OPTIMIZE_NOT_CALLED,
            ))
            break
        end
    end
end

@testset "MIP Problem with 3 variables" begin
    m = Model(Cbc.Optimizer)
    set_optimizer_attribute(m, "logLevel", 0)
    @variable(m, x[1:3] >= 0)
    @constraint(m, 0.5x[1]+3.1x[2]+4.2x[3] <= 6.1)   
    @constraint(m, 1.9x[1]+0.7x[2]+0.2x[3] <= 8.1)   
    @constraint(m, 2.9x[1]-2.3x[2]+4.2x[3] <= 10.5)   
    @objective(m, Max, x[1]+1.2x[2]+3.2x[3])

    bnb_model = BB.initialize(; 
        traverse_strategy = BB.BFS,
        Node = MIPNode,
        root = m,
        sense = objective_sense(m) == MOI.MAX_SENSE ? :Max : :Min
    )
    BB.set_root!(bnb_model, (
        lbs = zeros(length(x)),
        ubs = fill(Inf, length(x)),
        status = MOI.OPTIMIZE_NOT_CALLED
    ))

    BB.optimize!(bnb_model)

    sol_x = convert.(Int, BB.get_solution(bnb_model))

    @test sol_x == [2,0,1]
    @test BB.get_objective_value(bnb_model) ≈ 5.2
end

@testset "MIP Problem with 3 variables minimize" begin
    m = Model(Cbc.Optimizer)
    set_optimizer_attribute(m, "logLevel", 0)
    @variable(m, x[1:3] >= 0)
    @constraint(m, 0.5x[1]+3.1x[2]+4.2x[3] >= 6.1)   
    @constraint(m, 1.9x[1]+0.7x[2]+0.2x[3] >= 8.1)   
    @constraint(m, 2.9x[1]-2.3x[2]+4.2x[3] >= 10.5)   
    @objective(m, Min, x[1]+1.2x[2]+3.2x[3])

    bnb_model = BB.initialize(; 
        Node = MIPNode,
        root = m,
        sense = objective_sense(m) == MOI.MAX_SENSE ? :Max : :Min
    )
    BB.set_root!(bnb_model, (
        lbs = zeros(length(x)),
        ubs = fill(Inf, length(x)),
        status = MOI.OPTIMIZE_NOT_CALLED
    ))

    BB.optimize!(bnb_model)

    sol_x = BB.get_solution(bnb_model)

    @test sol_x ≈ [6.0,1.0,0.0]
    @test BB.get_objective_value(bnb_model) ≈ 7.2
end