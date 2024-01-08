import { Suspense, useState, useEffect } from 'react'
import { useLoaderData, defer, Await, useNavigate, useParams } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import LoadingSpinner from './components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Shimmer from './helper/Shimmer'
import Icon from './helper/MaterialIcon'
import UserProfileMonochrome from './../../src/assets/user-profile-monochrome.svg'
import styles from './Doctor.module.scss'
import Loading from './components/LoadingSpinner'
import MaterialIcon from './helper/MaterialIcon'
import Heading from './helper/Heading'
import { DidKeyMethod, DidDhtMethod, DidIonMethod } from '@web5/dids'
import doctorProtocol from '../protocols/doctor.json'

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
  const auth = useAuth()
  const params = useParams()
  const navigate = useNavigate()

  const handleNew = async () => {
    const doctorData = {
      '@type': 'doctor',
      fullname: document.querySelector('[name="fullname"]').value,
      specialist: document.querySelector('[name="specialist"]').value,
      author: auth.userDid,
      recipient: auth.mintDIDnode,
    }

    auth.installProtocol(doctorProtocol).then(async (result) => {
      const { record } = await auth.web5.dwn.records.create({
        data: doctorData,
        message: {
          published: true,
          protocol: doctorProtocol.protocol,
          protocolPath: 'doctor',
          schema: doctorProtocol.types.doctor.schema,
          dataFormat: doctorProtocol.types.doctor.dataFormats[0],
          author: auth.userDid,
          recipient: auth.mintDIDnode,
        },
        encryption: {
          enabled: true,
        },
      })
      console.log(record)

      const { status } = await record.send(auth.mintDIDnode)
      console.log(status)

      if (status.code === 202 && status.detail === 'Accepted') toast(`Saved`)

      return record
    })
  }

  const handleDelete = async (recordId) => {
    let t = toast.loading(`Deleting...`)

    ReadableStreamDefaultController
    const response = await auth.web5.dwn.records.delete({
      from: auth.mintDIDnode,
      message: {
        recordId: recordId,
        // author: userDid,
      },
    })
    console.log(response)

    if (response.status.code === 202 && response.status.detail === 'Accepted') {
      toast.success(`Deleted successfully`)
      toast.dismiss(t)
    } else toast.error(response.status.detail)
    return response
  }

  const handleQuery = async () => {
    auth.connectAgent().then(({ web5, userDid }) => {
      let t = toast.loading(`Reading doctor...`)
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

          let doctorList = []
          return response.records.forEach(async (record, i) => {
            record.data.json().then((recordData) => {
              console.log(recordData)
              recordData.recordId = record._recordId
              recordData.author = record.author

              doctorList.push(recordData)

              if (++i === response.records.length) {
                setData(doctorList)
                console.log(doctorList)
                toast.dismiss(t)
              }
            })
          })
        })
    })
  }

  useEffect(() => {
    handleQuery()
  }, [])

  return (
    <section className={`${styles.section} animate fade`}>
      <Heading title={title}></Heading>

      <div className={`__container`} data-width="medium">
        <div className={`grid grid--fill ${styles.list}`} style={{ '--data-width': '140px' }}>
          {data &&
            data.map((item, i) => {
              return (
                <div className="card" key={i} title={item.recordId}>
                  <div className="card__body d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column">
                      <p>{item.fullname}</p>
                      <p>
                        <small>{item.specialist}</small>
                      </p>
                    </div>

                    {item.author === auth.userDid && (
                      <>
                        <div onClick={() => handleDelete(item.recordId)}>
                          <MaterialIcon name="delete" style={{ color: 'red' }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

        <div className="card mt-20">
          <div className="card__body">
            <ul className="d-flex flex-column" style={{ rowGap: '1rem' }}>
              <li>
                <label htmlFor="">Full Name</label>
                <input type="text" name="fullname" />
                {/* Dr. Mark Hall */}
              </li>
              <li>
                <label htmlFor="">Specialist</label>
                <input type="text" name="specialist" defaultValue={`Ophthalmology`} />
              </li>
              <li>
                <button className="btn" onClick={() => handleNew()}>
                  Save
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
