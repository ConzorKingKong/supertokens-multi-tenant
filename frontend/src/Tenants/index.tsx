import axios from "axios";
import { getApiDomain } from "../config";
import { Link } from "react-router-dom";
import {useEffect, useState} from 'react'

export default function Tenants() {
  const [tenants, setTenants] = useState([])

  async function getTenants() {
    try {
      const tenantsCall = await axios.get(getApiDomain() + "/tenants")
      setTenants(tenantsCall.data.tenants.map((i: any) => {return i.tenantId}))
    } catch(e) {
      console.error(e)
    }
  }

  useEffect(() => {
    getTenants()
  }, [])
  
  return (
    <div style={{display: "flex", flexDirection: "column", margin: "auto"}}>
      <p>Click the org you're signed into to see information about it. Other routes are unauthorised</p>
      {tenants.map((i: any, index) => {
        return (
          <Link to={`/tenants/${i}`} key={index}>{i}</Link>
        )
      })}
    </div>
  )
}