import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Web5 } from '@web5/api'
import toast from 'react-hot-toast'

export const AuthContext = React.createContext()
export const useAuth = () => useContext(AuthContext)
export const isConnected = async () => localStorage.getItem('agentConnected')
export const localUserDid = async () => localStorage.getItem('userDid')

export const protocolDefinition = {
}

export function AuthProvider({ children }) {
  const [web5, setWeb5] = useState(null)
  const [userDid, setUserDid] = useState()
  const [profile, setProfile] = useState()
  const [profileBackup, setProfileBackup] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isConnectedAgent, setIsConnectedAgent] = useState(false)
  const [userDidLocal, setUserDidLocal] = useState(null)
  const [mintDIDnode, setMintDIDnode] = useState(
    'did:ion:EiDiU8lQFW0PhT1batcVJ3Xi1McU7pGxWZELwK7z0qFw2Q:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24tc2lnIiwicHVibGljS2V5SndrIjp7ImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ4IjoiWTFuRjNlVjRkX3ZuWlpxaXNJdmlEOG5ZNk5RX1pFTFJORXBkVEROZXBEdyJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifSx7ImlkIjoiZHduLWVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiI3cHJuVEJJWVd5X2FuTE9VTVNQMEEzVEhkOFhPeU9iVXNybHptazRRemFrIiwieSI6IkxrRHJKZGNFVU9EY3ZuN3R2dzJZQmh0ZGpPcW1STDREdkdnVUZXUUF1RVEifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7ImVuY3J5cHRpb25LZXlzIjpbIiNkd24tZW5jIl0sIm5vZGVzIjpbImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduMiIsImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduNCJdLCJzaWduaW5nS2V5cyI6WyIjZHduLXNpZyJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlDT1hCWlNxWlVEeXBrUDBHd2I4T1JTN3dCWnVnTko1UDN4WUxDMGtyU1RrZyJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQlhVaDFaajBBMWNld2M0Qjl2cDFjM1E0eTdiYkw0Nmh1QXZnQ1FCTDAtZ3ciLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUJtMzNDUDMyamROYmtXQVI3VkRpcDdOYUhVSnVoc19Xd0dfZzdoc3ZGbjVnIn19'
  )
  const navigate = useNavigate()
  const location = useLocation()

  function logout() {
    localStorage.removeItem('userDid')
    localStorage.removeItem('agentConnected')
    window.location.reload()
    setWeb5('')
    setUserDid('')
  }

  const installProtocol = async (protocolObj) => {
    connectAgent().then(async ({web5}) => {
      const { protocols, status } = await web5.dwn.protocols.query({
        message: {
          filter: {
            protocol: protocolObj.protocol,
          },
        },
      })

      if (status.code !== 200) {
        alert('Error querying protocols')
        console.error('Error querying protocols', status)
        return
      }

      // if the protocol already exists, we return
      if (protocols.length > 0) {
        console.log('Protocol already exists')
        return
      }

      // configure protocol on local DWN
      const { status: configureStatus, protocol } = await web5.dwn.protocols.configure({
        message: {
          definition: protocolObj,
        },
      })

      console.log('Protocol configured', configureStatus, protocol)
      let res = await protocol.send(userDid) //sends protocol to remote DWNs immediately (vs waiting for sync)
      console.log(res)
    })
  }
  // Reads the indicated record from the user's DWNs
  const readProfile = async () => {
    connectAgent().then((web5) => {
      let readingProfileToast = toast.loading(`Reading recently added profiles...`)
      web5.dwn.records
        .query({
          from: userDid,
          message: {
            filter: {
              protocol: protocolDefinition.protocol,
              protocolPath: 'profile',
              dataFormat: 'application/json',
              //recipient: userDid,
            },
            dateSort: 'createdDescending',
          },
        })
        .then((response) => {
          console.log(response)
          if (response.records.length < 1) {
            toast.dismiss(readingProfileToast)
            toast(`There is no record`, { icon: '⚠️' })
            return false
          }

          let profiles = []
          return response.records.forEach(async (record, i) => {
            record.data.json().then((recordData) => {
              console.log(recordData)
              recordData.recordId = record._recordId
              recordData.author = record.author

              profiles.push(recordData)
              if (++i === response.records.length) {
                setProfile(profiles)
                setProfileBackup(profiles.slice(0, 5))
                console.log(profiles)
                toast.dismiss(readingProfileToast)
              }
            })
          })
        })
    })
  }

  const readUserProfile = async (recordId) => {
    return connectAgent().then(async (web5) => {
      let readingProfileToast = toast.loading(`Reading user's profile...`)
      const response = await web5.dwn.records.query({
        from: userDid,
        message: {
          filter: {
            dataFormat: 'application/json',
            protocol: protocolDefinition.protocol,
            recordId: recordId,
          },
        },
      })
      console.log(response)
      toast.dismiss(readingProfileToast)

      if (response.records.length < 1) return false

      let recordData = await response.records[0].data.json()
      recordData.recordId = response.records[0]._recordId
      recordData.author = response.records[0].author
      return recordData
    })
  }
  /**
   * Initialize the web5
   * @returns
   */
  const connectAgent = async () => {
   // if (web5 !== null) return web5
    let t = toast.loading('Connecting to agent...')

    try {
      console.log('Initialize Web5')
      const { web5, did: userDid } = await Web5.connect({ sync: '5s' })
      console.log(web5, userDid)
      localStorage.setItem('agentConnected', true)
      localStorage.setItem('userDid', userDid)
      setWeb5(web5)
      setUserDid(userDid)
      localStorageStatus()
      toast.success(`Connected`, { icon: '✅' })
      toast.dismiss(t)

      return {web5, userDid}
    } catch (error) {
      toast.error(error.message)
      toast.dismiss(loadingToast)
    }
  }

  const localStorageStatus = () => {
    isConnected().then((res) => {
      setIsConnectedAgent(res)
    })
    // localUserDid().then((res) => {
    //   setUserDidLocal(res)
    // })
  }

  useEffect(() => {
    localStorageStatus()
  }, [])

  const value = {
    web5,
    setWeb5,
    userDid,
    setUserDid,
    readProfile,
    readUserProfile,
    protocolDefinition,
    isConnectedAgent,
    installProtocol,
    userDidLocal,
    isConnected,
    localUserDid,
    mintDIDnode,
    profile,
    setProfile,
    profileBackup,
    connectAgent,
    logout,
  }

  // if (!web5) return <>Loading... !user</>

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
