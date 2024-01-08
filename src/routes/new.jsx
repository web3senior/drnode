import { Suspense, useState, useEffect } from 'react'
import { useLoaderData, defer, Await, Link, useParams } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import LoadingSpinner from './components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Shimmer from './helper/Shimmer'
import Icon from './helper/MaterialIcon'
import UserProfileMonochrome from './../../src/assets/user-profile-monochrome.svg'
import styles from './Record.module.scss'
import Loading from './components/LoadingSpinner'

export const loader = async ({ request, params }) => {
  return defer({
    someDataHere: [],
  })
}

export default function New({ title }) {
  Title(title)
  const [loaderData, setLoaderData] = useState(useLoaderData())
  const [error, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState()
  const [pfp, setPfp] = useState(null)
  const [modal, setModal] = useState(false)
  const auth = useAuth()
  const params = useParams()

  const handleNew = async () => {
    auth.connectAgent().then(async (web5) => {
      auth.configureProtocol().then(async (res) => {
        const profileData = {
          '@type': 'profile',
          fullname: document.querySelector('[name="fullname"]').value,
          bio: document.querySelector('[name="bio"]').value,
          gender: document.querySelector('[name="gender"]').value,
          age: document.querySelector('[name="age"]').value,
          handler: document.querySelector('[name="handler"]').value,
          picture: pfp,
          author: auth.userDid,
          recipient: auth.userDid,
        }
        const { record } = await web5.dwn.records.create({
          data: profileData,
          message: {
            published: true,
            protocol: auth.protocolDefinition.protocol,
            protocolPath: 'profile',
            schema: auth.protocolDefinition.types.profile.schema,
            dataFormat: auth.protocolDefinition.types.profile.dataFormats[0],
            author: auth.userDid,
            recipient: auth.userDid,
          },
          encryption: {
            enabled: true,
          },
        })

        console.log(record)

        const { status } = await record.send(auth.mintDIDnode)
        console.log(status)
        if (status.code === 202 && status.detail === 'Accepted') toast.success(`Your Dprofile created successfully`)
        return record
      })
    })
  }

  function readFile(e) {
    console.log(e)

    if (!e.target.files || !e.target.files[0]) return

    if (e.target.files[0].size > 20000) {
      toast.error(`Maximum size for your avatar is 20KB`)
      return false
    }

    const FR = new FileReader()

    FR.addEventListener('load', function (evt) {
      document.querySelector('#pfpImg').src = evt.target.result
      console.log(evt.target.result)
      setPfp(evt.target.result)
    })

    FR.readAsDataURL(e.target.files[0])
  }

  useEffect(() => {
    // auth.readUserProfile(params.recordId).then((res) => {
    //   console.log(res)
    //   setData(res)
    // })
  }, [])

  return (
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
        <div className={`${styles.didItem} card`}>
          <div className={`card__header`}>New profile form</div>
          <div className="card__body">
            <ul className=" d-flex flex-column align-items-center justify-content-center" style={{ rowGap: '1rem' }}>
              <li style={{ width: '100%' }}>
                <figure>
                  <img id="pfpImg" alt={import.meta.env.VITE_NAME} src={UserProfileMonochrome} />
                  <label htmlFor="pfp">Profile Pciture</label>
                  <input id="pfp" type="file" onChange={(e) => readFile(e)} />
                  <small style={{ color: 'var(--danger)' }}>20KB maximum size</small>
                </figure>
              </li>
              <li style={{ width: '100%' }}>
                <label htmlFor="">Fullname</label>
                <input type="text" defaultValue={``} name="fullname" />
              </li>
              <li style={{ width: '100%' }}>
                <label htmlFor="">Handler</label>
                <input type="text" defaultValue={``} name="handler" />
              </li>
              <li style={{ width: '100%' }}>
                <label htmlFor="">Bio</label>
                <textarea name="bio" id="" cols="30" rows="5"></textarea>
              </li>
              <li style={{ width: '100%' }}>
                <label htmlFor="">Age</label>
                <input type="number" defaultValue={``} name="age" />
              </li>
              <li style={{ width: '100%' }}>
                <label htmlFor="">Gender</label>
                <select name="gender" id="">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </li>
              <li>
                <button onClick={() => handleNew()} className="mr-10">
                  Submit
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
