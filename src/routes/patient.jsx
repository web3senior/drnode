import { Suspense, useState, useEffect } from 'react'
import { useLoaderData, defer, Await, useNavigate, useParams } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import LoadingSpinner from './components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Shimmer from './helper/Shimmer'
import Icon from './helper/MaterialIcon'
import Loading from './components/LoadingSpinner'
import MaterialIcon from './helper/MaterialIcon'
import Heading from './helper/Heading'
import { VerifiableCredential, PresentationExchange } from '@web5/credentials'
import { DidKeyMethod, DidDhtMethod, DidIonMethod } from '@web5/dids'
import vcProtocol from '../protocols/vc.json'
import styles from './Allergy.module.scss'

export const loader = async ({ request, params }) => {
  return defer({
    someDataHere: [],
  })
}

export default function Patient({ title }) {
  Title(title)
  const [loaderData, setLoaderData] = useState(useLoaderData())
  const [error, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState()
  const auth = useAuth()
  const params = useParams()
  const navigate = useNavigate()

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
      let t = toast.loading(`Reading VC...`)
      web5.dwn.records
        .query({
          from: auth.mintDIDnode,
          message: {
            filter: {
              protocol: vcProtocol.protocol,
              protocolPath: 'vc',
              dataFormat: vcProtocol.types.vc.dataFormats[0],
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
              
// console.log(recordData.signedVcJwt)
              recordData.signedVcJwtEncoded=VerifiableCredential.parseJwt({ vcJwt: recordData.signedVcJwt})

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
        <div className={`grid grid--fill ${styles.list}`} style={{ '--data-width': '240px' }}>
          {data &&
            data.map((item, i) => {
              return (
                <div className="card" key={i} title={item.recordId}>
                  <div className="card__body d-flex justify-content-between">
                    <div className="d-flex flex-column">
                      <p>
                      <b>ID:</b> {item.signedVcJwtEncoded.vcDataModel.credentialSubject.id.slice(8, 14)}...{item.signedVcJwtEncoded.vcDataModel.credentialSubject.id.slice(-6)} 
                      </p>

                      <p>{item.signedVcJwtEncoded.vcDataModel.credentialSubject.key1}</p>
                    </div>
                    <div onClick={() => handleDelete(item.recordId)}>
                      <MaterialIcon name="delete" style={{ color: 'red' }} />
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </section>
  )
}
