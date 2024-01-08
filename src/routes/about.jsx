import { Title } from './helper/DocumentTitle'
import {Link} from 'react-router-dom'
import styles from './About.module.scss'
import Heading from './helper/Heading'
import { PopupButton } from '@typeform/embed-react'



export default function About({ title }) {
  Title(title)

  return (
    <section className={styles.section}>

    </section>
  )
}
