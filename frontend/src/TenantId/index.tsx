import { useParams } from "react-router-dom"
import { getApiDomain } from "../config"
import axios from "axios"
import { useEffect, useState } from "react"

export default function TenantId() {
  const {id} = useParams()
  const [display, setDisplay] = useState("")

  async function getTenant() {
    try {
      let tenant = await axios.get(getApiDomain() + `/tenants/${id}`, {withCredentials: true})

      if (tenant.data === "unauthorised") {
        setDisplay("Unauthorised")
        return
      }
      setDisplay(tenant.data.tenantId)
      return
    } catch(e: any) {
      console.error(e)
    }
  }

  useEffect(() => {
    getTenant()
  }, [])

  return (
    <div style={{margin: "auto"}}>
      {display}
    </div>
  )
}