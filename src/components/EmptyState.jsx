import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionLink,
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="mb-6 text-gray-600">
          <Icon className="w-20 h-20" />
        </div>
      )}
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      {description && (
        <p className="text-gray-400 text-center mb-6 max-w-md">{description}</p>
      )}
      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          {actionLabel}
        </Link>
      )}
      {action && actionLabel && !actionLink && (
        <button
          onClick={action}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
