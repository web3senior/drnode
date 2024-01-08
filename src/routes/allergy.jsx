import { Suspense, useState, useEffect } from 'react'
import { useLoaderData, defer, Await, useNavigate, useParams } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import LoadingSpinner from './components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Shimmer from './helper/Shimmer'
import Icon from './helper/MaterialIcon'
import UserProfileMonochrome from './../../src/assets/user-profile-monochrome.svg'
import styles from './Allergy.module.scss'
import Loading from './components/LoadingSpinner'
import MaterialIcon from './helper/MaterialIcon'
import Heading from './helper/Heading'
import { DidKeyMethod, DidDhtMethod, DidIonMethod } from '@web5/dids'
import allergyProtocol from './../protocols/allergy.json'

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
    const allergyData = {
      '@type': 'allergy',
      allergy_type: document.querySelector('[name="allergy_type"]').value,
      severity: document.querySelector('[name="severity"]').value,
      reaction_description: document.querySelector('[name="reaction_description"]').value,
      author: auth.userDid,
      recipient: auth.mintDIDnode,
    }

    auth.installProtocol(allergyProtocol).then(async (result) => {
      const { record } = await auth.web5.dwn.records.create({
        data: allergyData,
        message: {
          published: true,
          protocol: allergyProtocol.protocol,
          protocolPath: 'allergy',
          schema: allergyProtocol.types.allergy.schema,
          dataFormat: allergyProtocol.types.allergy.dataFormats[0],
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
      let t = toast.loading(`Reading allergy...`)
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
                setData(allergyList)
                console.log(allergyList)
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
                  <div className="card__body d-flex justify-content-between">
                    <div className="d-flex flex-column">
                      {item.allergy_type}
                      <small className="text-muted font-weight-light"> {item.severity}</small>
                      <br />
                      <small>{item.reaction_description}</small>
                    </div>
                    <div onClick={() => handleDelete(item.recordId)}>
                      <MaterialIcon name="delete" style={{ color: 'red' }} />
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        <div className="card mt-20">
          <div className="card__body">
            <ul className="d-flex flex-column" style={{ rowGap: '1rem' }}>
              <li>
                <label htmlFor="">Allergy Type</label>
                <select name="allergy_type">
                  <option>food</option>
                  <option>drug</option>
                  <option>latex</option>
                </select>
              </li>
              <li>
                <label htmlFor="">Severity</label>
                <select name="severity">
                  <option>mild</option>
                  <option>moderate</option>
                  <option>severe</option>
                </select>
              </li>
              <li>
                <label htmlFor="">Reaction Description</label>
                <textarea name="reaction_description" cols="30" rows="4"></textarea>
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
