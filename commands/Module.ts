import { BaseCommand, flags, args } from '@adonisjs/core/build/standalone'
import { join } from 'path'
import fs from 'fs'
import path from 'path'

export default class Module extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'create:module'
  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Generate dinamically modules'
  @flags.string({ alias: '-m' })
  public model: string

  @args.spread()
  public models: string[]
  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const name = this.model
    const models = this.models

    if (!name) {
      console.log('Please provide a model name.')
      return
    }

    try {
      for (let i = 0; i < models.length; i++) {
        const model = models[i]

        await this.generateController(name, model)
        await this.generateService(name, model)
        await this.generateModel(name, model)
        await this.generateSerializer(name, model)
        await this.generateExceptions(name, model)
      }

      await this.generateProvider(name)
      await this.generateEmail(name)
      await this.generateRoute(name)
    } catch (error) {}

    console.log(`Module ${name} created successfully!`)
  }

  private async generateController(module: string, model: string) {
    let controllerName = `${model}Controller`

    this.generator
      .addFile(model, {
        extname: '.ts',
        pattern: 'pascalcase',
        suffix: 'Controller',
      })
      .destinationDir(`app/Modules/${module}/Controllers`)
      .useMustache()
      .stub(join(__dirname, './templates/controller.txt'))
      .apply({ name: controllerName })
  }

  private async generateService(module: string, model: string) {
    let serviceName = `${model}Service`

    this.generator
      .addFile(model, {
        extname: '.ts',
        pattern: 'pascalcase',
        suffix: 'Service',
      })
      .destinationDir(`app/Modules/${module}/Services`)
      .useMustache()
      .stub(join(__dirname, './templates/service.txt'))
      .apply({ name: serviceName })
  }

  private async generateModel(module: string, model: string) {
    let modelName = `${model}`

    this.generator
      .addFile(model, {
        extname: '.ts',
        pattern: 'pascalcase',
      })
      .destinationDir(`app/Modules/${module}/Models`)
      .useMustache()
      .stub(join(__dirname, './templates/model.txt'))
      .apply({ name: modelName })
  }

  private async generateSerializer(module: string, model: string) {
    let serviceName = `${model}Serializer`

    this.generator
      .addFile(model, {
        extname: '.ts',
        pattern: 'pascalcase',
        suffix: 'Serializer',
      })
      .destinationDir(`app/Modules/${module}/Serializers`)
      .useMustache()
      .stub(join(__dirname, './templates/serializer.txt'))
      .apply({ name: serviceName })
  }

  private async generateExceptions(module: string, model: string) {
    let serviceName = `${model}NotFoundError`

    this.generator
      .addFile(serviceName, {
        extname: '.ts',
        pattern: 'pascalcase',
      })
      .destinationDir(`app/Modules/${module}/Exceptions`)
      .useMustache()
      .stub(join(__dirname, './templates/exceptions.txt'))
      .apply({ name: serviceName })
  }

  private async generateProvider(name: string) {
    let serviceName = `${name}`

    this.generator
      .addFile(serviceName, {
        extname: '.ts',
        pattern: 'pascalcase',
        suffix: 'Provider',
      })
      .destinationDir(`providers`)
      .useMustache()
      .stub(join(__dirname, './templates/provider.txt'))
      .apply({ name: serviceName })
  }

  private async generateEmail(name: string) {
    let serviceName = `${name}`

    this.generator
      .addFile(serviceName, {
        extname: '.ts',
        pattern: 'pascalcase',
        suffix: 'Email',
      })
      .destinationDir(`app/Modules/${name}/Emails`)
      .useMustache()
      .stub(join(__dirname, './templates/email.txt'))
      .apply({ name: serviceName })

    await this.createView(name)
  }

  private async createView(name: string) {
    let serviceName = `${name}`

    this.generator
      .addFile(serviceName, {
        extname: '.ts',
        pattern: 'pascalcase',
        suffix: 'View',
      })
      .destinationDir(`app/Modules/${name}/Views`)
      .useMustache()
      .stub(join(__dirname, './templates/view.txt'))
      .apply({ name: serviceName })
  }

  private async generateRoute(name: string) {
    let routeName = `${name}Routes`

    this.generator
      .addFile(name, {
        extname: '.ts',
        pattern: 'pascalcase',
        suffix: 'Routes',
      })
      .destinationDir(`app/Modules/${name}/Routes`)
      .useMustache()
      .stub(join(__dirname, './templates/route.txt'))
      .apply({ name: routeName, model: name, modelMin: name.toLowerCase() })

    await this.generator.run()

    await this.subscribeRoute(routeName, name)
  }

  private async subscribeRoute(name: string, model: string) {
    const filePath = path.join(__dirname, '../start/routes/app/index.ts')

    let lineaImports = `import "App/Modules/${model}/Routes/${name}"`
    //let lineaRoutes = `${name}();`

    try {
      // Leer el contenido actual del archivo
      let contenido = fs.readFileSync(filePath, 'utf8')

      // Encontrar el índice donde se encuentra '//imports'
      const indiceImports = contenido.indexOf('//imports')

      if (indiceImports === -1) {
        console.error('It was not found //imports in file.')
        return
      }

      // Insertar la línea de imports después de '//imports'
      contenido = contenido.replace('//imports', `//imports\n${lineaImports}`)

      // Escribir el nuevo contenido en el archivo
      fs.writeFileSync(filePath, contenido, 'utf8')

      console.log('Routes updated successfully!')
    } catch (err) {
      console.error(err)
    }
  }
}
