import { cn } from '../../utils/classNames';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  );
};

export const SkeletonCard = () => {
  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <div className='flex items-center gap-4 mb-4'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='flex-1'>
          <Skeleton className='h-6 w-3/4 mb-2' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      </div>
      <div className='space-y-3'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-5/6' />
        <Skeleton className='h-4 w-4/6' />
      </div>
    </div>
  );
};