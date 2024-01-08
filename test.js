import { VerifiableCredential, PresentationExchange } from '@web5/credentials'
import { DidKeyMethod, DidDhtMethod, DidIonMethod } from '@web5/dids'

const employerDid = await DidIonMethod.create()
console.log(employerDid)
