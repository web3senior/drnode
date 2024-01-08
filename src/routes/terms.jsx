import { Title } from './helper/DocumentTitle'
import styles from './Support.module.scss'

export default function Terms({ title }) {
  Title(title)

  return <section className={styles.section}>test</section>
}
