import { useEffect, useState } from 'react'
import { useNavigate, defer, useLoaderData, Link } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import Loading from './components/LoadingSpinner'
import { CheckIcon, ChromeIcon, BraveIcon } from './components/icons'
import toast, { Toaster } from 'react-hot-toast'
import LogoCover from './../../src/assets/mindidchain.png'
import UserProfileMonochrome from './../../src/assets/user-profile-monochrome.svg'
import styles from './Vc.module.scss'
import Shimmer from './helper/Shimmer'
import { useAuth, protocolDefinition } from '../contexts/AuthContext'
import { Web5 } from '@web5/api'
import Heading from './helper/Heading'
import { VerifiableCredential, PresentationExchange } from '@web5/credentials'
import { DidKeyMethod, DidDhtMethod, DidIonMethod } from '@web5/dids'
import doctorProtocol from '../protocols/doctor.json'
import vcProtocol from '../protocols/vc.json'

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
  const [doctor, setDoctor] = useState()
  const [signedVcJwt, setSignedVcJwt] = useState()
  const [doctorTosend, setDoctorTosend] = useState()
  const [activeRecipient, setActiveRecipient] = useState(null)
  const auth = useAuth()
  const navigate = useNavigate()

  const createVC = async () => {
    auth.connectAgent().then(async (web5) => {
      console.log(web5)
      const anotherDid = await DidIonMethod.create() // I coudn't get the current connected user's DID from web5.connect()method
      console.log(anotherDid)
      // return
      setDoctorTosend(document.querySelector('[name="doctor_did"]').value)

      const vc = await VerifiableCredential.create({
        type: 'HealthCredential',
        issuer: auth.userDid,
        subject: document.querySelector('[name="doctor_did"]').value,
        expirationDate: document.querySelector('[name="expiration"]').value, //'2024-09-30T12:34:56Z',
        data: {
          key1: 'val1',
          key2: 'val22222222222',
        },
      })

      console.log(vc)

      const signedVcJwt = await vc.sign({ did: anotherDid })
      setSignedVcJwt(signedVcJwt)
      console.log({ signedVcJwt })

      // const resres = VerifiableCredential.parseJwt({ vcJwt: signedVcJwt })
      // console.log(resres)
      // verify
      try {
        await VerifiableCredential.verify({ vcJwt: signedVcJwt })
        console.log('\nVC Verification successful!\n')
      } catch (err) {
        console.log('\nVC Verification failed: ' + err.message + '\n')
      }
    })
  }

  const sendToDoctor = async () => {
    auth.installProtocol(vcProtocol).then(async (result) => {
      const vcData = {
        '@type': 'vc',
        signedVcJwt: signedVcJwt,
        author: auth.userDid,
        recipient: auth.mintDIDnode,
      }
      const { record } = await auth.web5.dwn.records.create({
        data: vcData,
        message: {
          published: true,
          protocol: vcProtocol.protocol,
          protocolPath: 'vc',
          schema: vcProtocol.types.vc.schema,
          dataFormat: vcProtocol.types.vc.dataFormats[0],
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

  const handleFetchDoctor = async () => {
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
                setDoctor(doctorList)
                console.log(doctorList)
                toast.dismiss(t)
              }
            })
          })
        })
    })
  }

  useEffect(() => {
    handleFetchDoctor()
  }, [])

  return (
    <>
      {isLoading && <Loading />}
      <section className={styles.section}>
        <Heading title={`Issue VC`}></Heading>
        <div className={`__container`} data-width="medium">
          <div className="form">
            <ul>
              <li>
                <label htmlFor="">Select data:</label>
                <select name="" id="" multiple>
                  <option value="">Personal Information</option>
                  <option value="">Allergy</option>
                  <option value="">Drug</option>
                  <option value="">Lab test</option>
                </select>
              </li>
              <li className="mt-20">
                <label htmlFor="">Doctor DID</label>
                <select name="doctor_did" id="" disabled={!doctor}>
                  {doctor &&
                    doctor.map((item, i) => {
                      return (
                        <option value={item.author} key={i}>
                          {item.fullname}
                        </option>
                      )
                    })}
                </select>
              </li>
              <li className="mt-20">
                <label htmlFor="">Expiration Date</label>
                <input type="text" name="expiration" defaultValue={`2024-02-30T12:34:56Z`} />
              </li>
            </ul>
          </div>
          <button onClick={() => createVC()} disabled={!doctor}>
            Issue
          </button>
          <button onClick={() => sendToDoctor()} className="ml-10" disabled={!doctor}>
            Send to doctor
          </button>
        </div>
      </section>
    </>
  )
}

export default Home