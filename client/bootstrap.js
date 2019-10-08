import { store } from '@things-factory/shell'
import { fetchFontList } from '@things-factory/font-base'
import { auth } from '@things-factory/auth-base'

export default function bootstrap() {
  auth.on('signin', () => {
    store.dispatch(fetchFontList({}))
  })
}
