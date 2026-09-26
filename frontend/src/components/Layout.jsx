import React from 'react';
import { GraduationCap, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
export const Layout=({children,admin=false})=><div className="app"><Sidebar admin={admin}/><main className="main"><div className="topbar"><Bell size={15} color="#7890aa"/><span className="hello">Hi, Student</span><div className="avatar">S</div></div>{children}</main></div>;
export const Page=({title,subtitle,children,action})=><section className="page"><div className="page-head"><div><div className="eyebrow">CareerIQ</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>{children}</section>;
export const Logo=()=> <div className="auth-logo"><GraduationCap size={30}/><strong>CareerIQ</strong></div>;
