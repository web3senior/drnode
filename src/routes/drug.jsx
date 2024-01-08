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
import drugProtocol from '../protocols/drug.json'

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
    const drugData = {
      '@type': 'drug',
      name: document.querySelector('[name="name"]').value,
      class: document.querySelector('[name="class"]').value,
      description: document.querySelector('[name="description"]').value,
      dosage_form: document.querySelector('[name="dosage_form"]').value,
      strength: document.querySelector('[name="strength"]').value,
      manufacturer: document.querySelector('[name="manufacturer"]').value,
      start_date: document.querySelector('[name="start_date"]').value,
      author: auth.userDid,
      recipient: auth.mintDIDnode,
    }

    auth.installProtocol(drugProtocol).then(async (result) => {
      const { record } = await auth.web5.dwn.records.create({
        data: drugData,
        message: {
          published: true,
          protocol: drugProtocol.protocol,
          protocolPath: 'drug',
          schema: drugProtocol.types.drug.schema,
          dataFormat: drugProtocol.types.drug.dataFormats[0],
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
      let t = toast.loading(`Reading drug...`)
      web5.dwn.records
        .query({
          from: auth.mintDIDnode,
          message: {
            filter: {
              protocol: drugProtocol.protocol,
              protocolPath: 'drug',
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

          let drugList = []
          return response.records.forEach(async (record, i) => {
            record.data.json().then((recordData) => {
              console.log(recordData)
              recordData.recordId = record._recordId
              recordData.author = record.author

              drugList.push(recordData)

              if (++i === response.records.length) {
                setData(drugList)
                console.log(drugList)
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
                      {item.name}
                      <small className="text-muted font-weight-light"> {item.class}</small>
                      <br />
                      <p><small>{item.dosage_form}</small>  [<small>{item.start_date}</small>]</p>
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
                <label htmlFor="">Drug Name</label>
                <input type="text" name="name" />
              </li>
              <li>
                <label htmlFor="">Drug Class</label>
                <select name="class">
                  <option>antibiotic</option>
                  <option>anti-inflammatory</option>
                  <option>latex</option>
                </select>
                <small className="text-muted">The drug's therapeutic class</small>
              </li>
              <li>
                <label htmlFor="">Dosage Form</label>
                <select name="dosage_form">
                  <option>tablet</option>
                  <option>capsule</option>
                  <option>liquid</option>
                </select>
              </li>
              <li>
                <label htmlFor="">Strength</label>
                <input type="text" name="strength" defaultValue={2} />
                <small>The drug's strength or concentration (10,2)</small>
              </li>
              <li>
                <label htmlFor="">Manufacturer</label>
                <input type="text" name="manufacturer"/>
              </li>
              <li>
                <label htmlFor="">Description</label>
                <textarea name="description" cols="30" rows="4"></textarea>
              </li>
              <li>
                <label htmlFor="">Start</label>
                <input type="date" name="start_date" id="" />
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
