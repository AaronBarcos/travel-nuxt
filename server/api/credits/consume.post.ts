import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )
  
  const body = await readBody(event)
  const { userId, anonUserId } = body

  if (!userId && !anonUserId) {
    throw createError({
      statusCode: 400,
      message: 'Se requiere userId o anonUserId'
    })
  }

  if (userId) {
    try {
      const { data, error } = await supabase.rpc('consume_user_credit', {
        user_id_param: userId
      })

      if (error) {
        if (error.code === 'P0001') {
          throw createError({
            statusCode: 403,
            message: 'No tienes créditos suficientes'
          })
        }
        throw createError({
          statusCode: 500,
          message: 'Error al consumir crédito'
        })
      }

      return { success: true, remaining: data?.remaining || 0 }
    } catch (err: any) {
      if (err.statusCode) {
        throw err
      }
      throw createError({
        statusCode: 500,
        message: 'Error al consumir crédito'
      })
    }
  } else {
    throw createError({
      statusCode: 400,
      message: 'Los usuarios anónimos deben consumir créditos en el cliente'
    })
  }
})

