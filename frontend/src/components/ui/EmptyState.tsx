import { default as Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-4'>
      {icon && (
        <div className='text-gray-400 mb-4 text-5xl'>
          {icon}
        </div>
      )}
      <h3 className='text-lg font-semibold text-gray-900 mb-2 text-center'>
        {title}
      </h3>
      <p className='text-sm text-gray-600 mb-6 text-center max-w-md'>
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant='primary'>
          {action.label}
        </Button>
      )}
    </div>
  );
};