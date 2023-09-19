import I18n from '@ioc:Adonis/Addons/I18n'

export async function t(key: string, options = {}): Promise<string> {
  // Intenta obtener el valor del auth desde el caché
  let auth: any = /* await Cache.get('auth') */ null

  // Si no se encuentra en el caché, se asume que no hay un usuario autenticado
  if (!auth) {
    auth = { user: { lang: 'en' } } // Establece un valor predeterminado
  }

  // Obtiene el locale del usuario autenticado
  const locale = auth.user.lang

  // Obtiene la traducción utilizando el paquete i18n y pasa las opciones
  return I18n.locale(locale).formatMessage(key, options)
}

export async function setAuth(auth: any): Promise<void> {
  // Guarda el valor del auth en el caché
  // await Cache.set('auth', auth, 10000)
  console.log({ auth })
}
