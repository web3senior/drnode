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

export default function Hhs({ title }) {
  Title(title)
  const [loaderData, setLoaderData] = useState(useLoaderData())
  const [error, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([
    {
      logo: 'data:image/png;base64,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',
      name: 'United States Department of Health and Human Services',
      description:
        'The United States Department of Health and Human Services is a cabinet-level executive branch department of the U.S. federal government created to protect the health of the U.S. people and providing essential human services. Its motto is "Improving the health, safety, and well-being of America"',
      founded: `April 11, 1953`,
      jurisdiction: `United States`,
      founder: `Dwight D. Eisenhower`,
      subsidiaries: `Centers for Medicare & Medicaid Services, MORE`,
      headquarters: `Washington, D.C., United States`,
      budget: `$1.631 trillion (2022)`,
      employees: `79,540 (2015)`,
      did: `did:ion:EiB0meQxcW6uWLYi8DiEhcqUJwmT5WFYbAsP7P2yips3dg:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24tc2lnIiwicHVibGljS2V5SndrIjp7ImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ4IjoiOHYtYnpBRkR2ei1jQXNxVFMyUVdTMlBkUkktZHd4TjJDQ01ldTdjTXNCdyJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifV0sInNlcnZpY2VzIjpbXX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQmE4Z0s0QWlJaTh3R2o0dF9oNGstUDFub0l3RkF2eXhRZFBUZVExbUZwb3cifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUNaWWhGdXVwZnkzUmNjdEdvQ2FRWXZRSklQZVVYcEZmUUswLS1rSnZpNTlBIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEXzlTS2I0VmdIMjFLdUxPOVVERkNfRHo1ajJDSW1fTmNTQVE2enB4TmI5USJ9fQ`
    },
  ])
  const auth = useAuth()
  const params = useParams()
  const navigate = useNavigate()

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
    // handleQuery()
  }, [])

  return (
    <section className={`${styles.section} animate fade`}>
      <Heading title={title}></Heading>

      <div className={`__container`} data-width="medium">
        <div className={`grid grid--fill ${styles.list}`} style={{ '--data-width': '200px' }}>
          {data &&
            data.map((item, i) => {
              return (
                <div className="card" key={i} title={item.recordId}>
                  <div className="d-flex flex-column align-items-center justify-content-center text-center">
                    <figure>
                      <img src={item.logo} />
                    </figure>
                    <h6>{item.name}</h6>
                    <div className='text-left mt-40'>
                    <p>{item.founded}</p>
                    <p>{item.jurisdiction}</p>
                    <p>{item.subsidiaries}</p>
                    <p>{item.headquarters}</p>
                    <p>{item.budget}</p>
                    <p>{item.employees}</p>
                    <label htmlFor=""><b>DID:</b></label>
                    <input type="text" defaultValue={item.did} />
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
