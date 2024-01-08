import { useEffect, useState } from 'react'
import { useNavigate, defer, useLoaderData, Link } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import Loading from './components/LoadingSpinner'
import { CheckIcon, ChromeIcon, BraveIcon } from './components/icons'
import toast, { Toaster } from 'react-hot-toast'
import LogoCover from './../../src/assets/mindidchain.png'
import UserProfileMonochrome from './../../src/assets/user-profile-monochrome.svg'
import styles from './Home.module.scss'
import Shimmer from './helper/Shimmer'
import { useAuth, protocolDefinition } from './../contexts/AuthContext'
import { Web5 } from '@web5/api'

export const loader = async () => {
  return defer({
    key: await [],
  })
}

function Home({ title }) {
  Title(title)
  const [loaderData, setLoaderData] = useState(useLoaderData())
  const [error, setError] = useState()
  const [isLoading, setIsLoading] = useState()
  const [data, setData] = useState([])
  const [activeRecipient, setActiveRecipient] = useState(null)
  const auth = useAuth()
  const navigate = useNavigate()

  const handleConnect = async (e) => {
    auth.connectAgent().then((web5) => {
      navigate('/tools')
    })
  }

  useEffect(() => {
  }, [])

  return (
    <>
      {isLoading && <Loading />}
      <section className={styles.section}>
        <div className={`__container`} data-width="medium">
          <div className={`${styles.container} text-center d-flex flex-column align-items-center justify-content-center`}>
            <figure>
              <img alt={import.meta.env.VITE_NAME} src={LogoCover} className={styles.heroImage} />
            </figure>
            <div className={styles.connectBtn} onClick={() => handleConnect()}>
              <svg width="96" height="95" viewBox="0 0 96 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M95.5 47.5C95.5 73.7335 74.2335 95 48 95C21.7665 95 0.5 73.7335 0.5 47.5C0.5 21.2665 21.7665 0 48 0C74.2335 0 95.5 21.2665 95.5 47.5ZM6.01346 47.5C6.01346 70.6885 24.8115 89.4865 48 89.4865C71.1885 89.4865 89.9865 70.6885 89.9865 47.5C89.9865 24.3115 71.1885 5.51346 48 5.51346C24.8115 5.51346 6.01346 24.3115 6.01346 47.5Z"
                  fill="#AB71FF"
                />
                <circle cx="48.3442" cy="47.8442" r="36.1413" fill="#F68FFF" />
                <path
                  d="M48.3442 37.8623L57.9819 47.5M57.9819 47.5L48.3442 57.1377M57.9819 47.5C57.4311 47.5 44.2137 47.5 37.6739 47.5"
                  stroke="black"
                  strokeWidth="3.44203"
                  strokeLinecap="round"
                />
              </svg>

              <b>Connect</b>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
