import { PromotionPanel } from '../components/promotion-panel'
import { LoginForm } from '../components/login-form'
import styles from './login-page.module.css'

export function LoginPage() {
  return <main className={styles.page}><PromotionPanel /><LoginForm /></main>
}
