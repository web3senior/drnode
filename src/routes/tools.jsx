import { Suspense, useState, useEffect } from 'react'
import { useLoaderData, defer, Await, useNavigate, useParams, Link } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import LoadingSpinner from './components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Shimmer from './helper/Shimmer'
import allergyProtocol from './../protocols/allergy.json'
import doctorProtocol from './../protocols/doctor.json'
import vcProtocol from './../protocols/vc.json'
import Loading from './components/LoadingSpinner'
import MaterialIcon from './helper/MaterialIcon'
import Logo from './../../public/logo.svg'
import styles from './Tools.module.scss'

export const loader = async ({ request, params }) => {
  return defer({
    someDataHere: [],
  })
}

export default function Profile({ title }) {
  Title(title)
  const [loaderData, setLoaderData] = useState(useLoaderData())
  const [error, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState()
  const [allergyCount, setAllergyCount] = useState(0)
  const [doctorCount, setDoctorCound] = useState(0)
  const [vcCount, setVcCount] = useState(0)
  const [modal, setModal] = useState(false)
  const auth = useAuth()
  const params = useParams()
  const navigate = useNavigate()
  const handleNavLink = (route) => {
    if (route) navigate(route)
    handleOpenNav()
  }

  const handleOpenNav = () => {
    document.querySelector('#modal').classList.toggle('open')
    document.querySelector('#modal').classList.toggle('blur')
    document.querySelector('.cover').classList.toggle('showCover')
  }

  const readCountOfAllergy = async () => {
    auth.connectAgent().then(({ web5, userDid }) => {
      let t = toast.loading(`Reading allergy count...`)
      web5.dwn.records
        .query({
          from: auth.mintDIDnode,
          message: {
            filter: {
              protocol: allergyProtocol.protocol,
              protocolPath: 'allergy',
              dataFormat: 'application/json',
              author: userDid,
            },
            dateSort: 'createdDescending',
          },
        })
        .then((response) => {
          console.log(response)

          if (response.records.length < 1) {
            toast.dismiss(t)
            toast(`There is no record`, { icon: '⚠️' })
            return false
          }

          let allergyList = []
          return response.records.forEach(async (record, i) => {
            record.data.json().then((recordData) => {
              console.log(recordData)
              recordData.recordId = record._recordId
              recordData.author = record.author

              allergyList.push(recordData)

              if (++i === response.records.length) {
                setAllergyCount(allergyList.length)
                console.log(allergyList)
                toast.dismiss(t)
              }
            })
          })
        })
    })
  }

  const readCountOfDoctor = async () => {
    auth.connectAgent().then(({ web5, userDid }) => {
      let t = toast.loading(`Reading doctor count...`)
      web5.dwn.records
        .query({
          from: auth.mintDIDnode,
          message: {
            filter: {
              protocol: doctorProtocol.protocol,
              protocolPath: 'doctor',
              dataFormat: 'application/json',
              // author: userDid,
            },
            dateSort: 'createdDescending',
          },
        })
        .then((response) => {
          console.log(response)

          if (response.records.length < 1) {
            toast.dismiss(t)
            toast(`There is no record`, { icon: '⚠️' })
            return false
          }

          let allergyList = []
          return response.records.forEach(async (record, i) => {
            record.data.json().then((recordData) => {
              console.log(recordData)
              recordData.recordId = record._recordId
              recordData.author = record.author
              allergyList.push(recordData)

              if (++i === response.records.length) {
                setDoctorCound(allergyList.length)
                console.log(allergyList)
                toast.dismiss(t)
              }
            })
          })
        })
    })
  }

  const readCountOfVc = async () => {
    auth.connectAgent().then(({ web5, userDid }) => {
      let t = toast.loading(`Reading VC count...`)
      web5.dwn.records
        .query({
          from: auth.mintDIDnode,
          message: {
            filter: {
              protocol: vcProtocol.protocol,
              protocolPath: 'vc',
              dataFormat: vcProtocol.types.vc.dataFormats[0],
              // author: userDid,
            },
            dateSort: 'createdDescending',
          },
        })
        .then((response) => {
          console.log(response)

          if (response.records.length < 1) {
            toast.dismiss(t)
            toast(`There is no record`, { icon: '⚠️' })
            return false
          }

          let allergyList = []
          return response.records.forEach(async (record, i) => {
            record.data.json().then((recordData) => {
              console.log(recordData)
              recordData.recordId = record._recordId
              recordData.author = record.author
              allergyList.push(recordData)

              if (++i === response.records.length) {
                setVcCount(allergyList.length)
                console.log(allergyList)
                toast.dismiss(t)
              }
            })
          })
        })
    })
  }

  useEffect(() => {
    readCountOfAllergy()
    readCountOfDoctor()
    readCountOfVc()
  }, [])

  return (
    <>
      <header className={`${styles.header}`}>
        <ul className={`d-flex align-items-center justify-content-between`}>
          <li className="d-flex flex-column">
            <span onClick={() => handleOpenNav()}>
              <svg width="33" height="23" viewBox="0 0 33 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 3H3" stroke="#282828" strokeWidth="5" strokeLinecap="round" />
                <path d="M16 11.5L3 11.5" stroke="#282828" strokeWidth="5" strokeLinecap="round" />
                <path d="M23 20L3 20" stroke="#282828" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </li>
          <li>
            <Link to={`/home`}>
              <figure>
                <img src={Logo} alt={`upcard`} className={`${styles.header__logo} `} />
              </figure>
            </Link>
          </li>
        </ul>
      </header>
      <div className="cover" onClick={() => handleOpenNav()} />

      <nav className={`${styles.nav} animate`} id="modal">
        <figure>{/* <img src={Logo} alt={`logo`} /> */}</figure>
        <ul>
          <li className="">
            <button onClick={() => handleNavLink(`/`)}>
              <MaterialIcon name="home" />
              <span>Home</span>
            </button>
          </li>
          <li className="">
            <button onClick={() => handleNavLink(`/about`)}>
              <MaterialIcon name="info" />
              <span>About us</span>
            </button>
          </li>
        </ul>

        <small>{`Version ${import.meta.env.VITE_VERSION}`}</small>
      </nav>
      <section className={`${styles.section} animate fade`}>
        {modal && (
          <>
            <div className={styles.overlay}>
              <div className={`${styles.overlayContainer} card`}>
                <div className="card__header">
                  <b>Add your UPcard name, symbol, and count 🦄</b>
                </div>
                <div className="card__body">{data && data.length === 1 && <>333</>}</div>
              </div>
            </div>
          </>
        )}

        <div className={`__container`} data-width="medium">
          <div className={`grid grid--fill  ${styles.dashboard}`} style={{ '--data-width': '140px' }}>
            <div>
              <label htmlFor="">Doctor</label>
              <div className="card">
                <div className="card__body">
                  <span>{doctorCount}</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="">VC</label>
              <div className="card">
                <div className="card__body">
                  <span>{vcCount}</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="">Lab test</label>
              <div className="card">
                <div className="card__body">
                  <span>0</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="">Allergy</label>
              <div className="card">
                <div className="card__body">
                  <span>{allergyCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`grid grid--fill  ${styles.links}`} style={{ '--data-width': '100px' }}>
            <div onClick={() => navigate(`/hhs`)}>
              <MaterialIcon name="apartment" />
              <span title={`United States Department of Health and Human Services`}>HHS</span>
            </div>
            <div onClick={() => navigate(`/doctor`)}>
              <MaterialIcon name="stethoscope" />
              <span>Doctor</span>
            </div>
            <div onClick={() => navigate(`/patient`)}>
              <MaterialIcon name="personal_injury" />
              <span>Patient</span>
            </div>
            <div onClick={() => navigate(`/vc`)}>
              <MaterialIcon name="shield_locked" />
              <span>VC</span>
            </div>
            <div onClick={() => navigate(`/allergy`)}>
              <MaterialIcon name="allergy" />
              <span>Allergy</span>
            </div>
            <div style={{ opacity: '.4' }}>
              <MaterialIcon name="labs" />
              <span>Lab tests</span>
            </div>
            <div onClick={() => navigate(`/drug`)}>
              <MaterialIcon name="pill" />
              <span>Drugs</span>
            </div>
            <div style={{ opacity: '.4' }}>
              <MaterialIcon name="grocery" />
              <span>Diet</span>
            </div>
            <div style={{ opacity: '.4' }}>
              <MaterialIcon name="face_4" />
              <span>Nurse</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
