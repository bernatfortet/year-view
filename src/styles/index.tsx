import React, { forwardRef } from 'react'

import { cn } from '@/lib/utils'

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  style?: React.CSSProperties
}

export const Row = forwardRef<HTMLDivElement, LayoutProps>(function Row(props, ref) {
  const { className, ...rest } = props
  return <div ref={ref} className={cn('flex flex-row', className)} {...rest} />
})

export const Column = forwardRef<HTMLDivElement, LayoutProps>(function Column(props, ref) {
  const { className, ...rest } = props
  return <div ref={ref} className={cn('flex flex-col', className)} {...rest} />
})

export const Grid = forwardRef<HTMLDivElement, LayoutProps>(function Grid(props, ref) {
  const { className, ...rest } = props
  return <div ref={ref} className={cn('grid', className)} {...rest} />
})

