"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./reports.module.css";
type Category="all"|"regular"|"proposed"|"pm"|"tugger";
type Report={id:string;category?:string;reportTypeLabel?:string;technician?:string;reportDate?:string;facilityAddress?:string;trackingNumber?:string;facilityId?:string;itemCount?:number};
const TABS:{key:Category;label:string}[]=[{key:"all",label:"All Reports"},{key:"regular",label:"Regular Jobs"},{key:"proposed",label:"Proposed Work"},{key:"pm",label:"Preventive Maintenance"},{key:"tugger",label:"Tugger"}];
const categoryOf=(r:Report)=>r.category||"pm";
export default function ReportsClient(){
 const[reports,setReports]=useState<Report[]>([]),[query,setQuery]=useState(""),[tab,setTab]=useState<Category>("all"),[error,setError]=useState(""),[deletingId,setDeletingId]=useState("");
 useEffect(()=>{fetch("/api/pm-reports",{cache:"no-store"}).then(async r=>{if(!r.ok)throw new Error(await r.text());return r.json()}).then(setReports).catch(e=>setError(String(e)))},[]);
 const shown=useMemo(()=>reports.filter(r=>(tab==="all"||categoryOf(r)===tab)&&JSON.stringify(r).toLowerCase().includes(query.toLowerCase())),[reports,query,tab]);
 async function deleteReport(report:Report){const label=report.trackingNumber||report.facilityId||"this report";if(!confirm(`Permanently delete ${label}? This cannot be undone.`))return;setDeletingId(report.id);setError("");try{const response=await fetch(`/api/pm-reports?id=${encodeURIComponent(report.id)}`,{method:"DELETE"});if(!response.ok)throw new Error(await response.text());setReports(current=>current.filter(item=>item.id!==report.id))}catch(cause){setError(`Could not delete report: ${cause instanceof Error?cause.message:String(cause)}`)}finally{setDeletingId("")}}
 return <main className={styles.page}><header className={styles.header}><div><p>FRONTLINE PRO SERVICES</p><h1>Completed Reports</h1></div><div className={styles.actions}><a href="/pm-report">New Report</a><a href="/fedex-tracker">Back to Tracker</a></div></header><section className={styles.content}>
 <div className={styles.tabs}>{TABS.map(item=><button key={item.key} className={tab===item.key?styles.activeTab:""} onClick={()=>setTab(item.key)}>{item.label}<span>{item.key==="all"?reports.length:reports.filter(r=>categoryOf(r)===item.key).length}</span></button>)}</div>
 <div className={styles.summary}><div><strong>{shown.length}</strong><span>{tab==="all"?"completed reports":TABS.find(t=>t.key===tab)?.label}</span></div><input aria-label="Search reports" placeholder="Search tracking, facility, technician…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
 {error&&<p className={styles.error}>Could not load reports: {error}</p>}<div className={styles.list}>{shown.map(r=><article key={r.id}><div><p className={styles.eyebrow}>{r.reportTypeLabel||"Preventive Maintenance Report"}</p><h2>{r.facilityId||"Facility"} · {r.trackingNumber||"No tracking number"}</h2><p>{r.facilityAddress||"Address not entered"}</p><p>{r.technician||"Technician not entered"} · {r.reportDate||"No date"} · {r.itemCount||0} items</p></div><div className={styles.reportActions}><a target="_blank" rel="noreferrer" href={`/api/pm-reports?id=${encodeURIComponent(r.id)}`}>View PDF</a><button type="button" onClick={()=>deleteReport(r)} disabled={deletingId===r.id}>{deletingId===r.id?"Deleting…":"Delete"}</button></div></article>)}</div>{!error&&shown.length===0&&<p className={styles.empty}>No completed reports found in this category.</p>}
 </section></main>;
}
