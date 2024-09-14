import { DMMF } from "@prisma/generator-helper"

export type Model = {
  name: string
  fields: {
    name: string
    type: string
    hasConnections?: boolean
  }[]
  isChild?: boolean
}

export type Enum = {
  name: string
  values: string[]
}

export type ModelConnection = {
  target: string
  source: string
  name: string
}

/**
 * Transforma el DMMF a un formato que puede ser usado por la aplicación de React.
 * Genera una lista de modelos y una lista de conexiones.
 */
export function transformDmmfToModelsAndConnections(dmmf: DMMF.Document): {
  models: Model[]
  enums: Enum[]
  connections: ModelConnection[]
} {
  const models = generateModels(dmmf.datamodel.models)
  const enums = generateEnums(dmmf.datamodel.enums)
  const connections = generateModelConnections(dmmf.datamodel.models)

  return { models, enums, connections }
}

/**
 * Genera un arreglo de objetos de modelo basado en los modelos del DMMF.
 */
export function generateModels(models: readonly DMMF.Model[]): Model[] {
  return models.map((model) => ({
    name: model.name,
    fields: model.fields.map((field) => ({
      name: field.name,
      type: field.isList ? `${field.type}[]` : field.type,
      hasConnections:
        field.kind === "object" || (field.relationFromFields?.length ?? 0) > 0,
    })),
    isChild: model.fields.some(
      (field) => field.relationFromFields?.length ?? 0 > 0,
    ),
  }))
}

export function generateEnums(enums: readonly DMMF.DatamodelEnum[]): Enum[] {
  return enums.map((enumItem) => ({
    name: enumItem.name,
    values: enumItem.values.map((v) => v.name),
  }))
}

/**
 * Genera las conexiones entre modelos en base a las relaciones definidas en el DMMF.
 */
export function generateModelConnections(
  models: readonly DMMF.Model[],
): ModelConnection[] {
  const connections: ModelConnection[] = []

  models.forEach((model) => {
    model.fields.forEach((field) => {
      const targetModelName = field.type
      const connectionName = field.relationName || field.name

      // Si el tipo del campo es otro modelo, creamos una conexión
      const isConnectedToOtherModel = models.some(
        (m) => m.name === targetModelName,
      )

      if (isConnectedToOtherModel) {
        connections.push({
          source: `${model.name}-${field.name}-source`, // Cambiar el id del source handle
          target: `${targetModelName}-target`, // Cambiar el id del target handle
          name: connectionName,
        })
      }
    })
  })

  return connections
}
