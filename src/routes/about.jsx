import { Title } from './helper/DocumentTitle'
import { Link } from 'react-router-dom'
import styles from './About.module.scss'
import Heading from './helper/Heading'
import { PopupButton } from '@typeform/embed-react'

export default function About({ title }) {
  Title(title)

  return (
    <section className={`${styles.section} animate fade`}>
      <Heading title={title}></Heading>
      <div className={`__container`} data-width="medium">
        <h6>Aratta Team</h6>
      </div>
    </section>
  )
}
