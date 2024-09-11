import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
} from "reactflow"
import { Model, ModelConnection } from "../lib/types/schema"
import { ModelNode } from "./ModelNode"

interface Props {
  models: Model[]
  connections: ModelConnection[]
}

export const SchemaVisualizer = ({ connections, models }: Props) => {
  const modelTypes = {
    model: ModelNode,
  }

  let row = 0
  let column = 0
  const numModels = models.length
  let numGrid = 1

  // eslint-disable-next-line no-constant-condition
  while (1) {
    if (numGrid ** 2 >= numModels) {
      break
    }
    numGrid++
  }

  const nodes: Node[] = models.map((model, index) => {
    const x = row * 300
    const y = column * 300

    if (numGrid % index === 0) {
      column = 0
      row += 1
    } else {
      column += 1
    }

    return {
      id: model.name,
      data: model,
      position: { x: x, y: y },
      type: "model",
    }
  })
  const edges: Edge[] = connections.map((connection) => {
    const sourceId = `${connection.source}-${connection.name}`
    const targetId = `${connection.target}-${connection.name}`
    return {
      id: `${connection.source}-${connection.target}-${connection.name}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: sourceId, // Coincide con el handle en ModelNode
      targetHandle: targetId, // Coincide con el handle en ModelNode
      animated: true,
    }
  })

  return (
    <div className="h-[100vh] w-full bg-[#1c1c1c] ">
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        fitView
        nodeTypes={modelTypes}
        fitViewOptions={{
          padding: 0.4,
        }}
      >
        <Background color="#222" variant={BackgroundVariant.Lines} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
