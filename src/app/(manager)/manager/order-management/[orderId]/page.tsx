"use client"

import { useParams } from 'next/navigation'
import React from 'react'

export default function OrderDetailsPage({}) {
  const { orderId } = useParams()


  return (
    <div>OrderDetailsPage: {orderId}</div>
  )
}
