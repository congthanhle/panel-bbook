import React from 'react';
import { Button, Typography } from 'antd';

const { Title, Text } = Typography;

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 drop-shadow-sm">
        {icon}
      </div>
      <Title level={4} className="!text-slate-800 !mb-2">
        {title}
      </Title>
      <Text className="text-slate-500 max-w-md block mb-8 text-base">
        {description}
      </Text>
      {actionText && onAction && (
        <Button 
          type="primary" 
          size="large" 
          onClick={onAction}
          className="bg-indigo-600 hover:bg-indigo-700 px-8 h-12 rounded-lg font-medium shadow-sm hover:shadow"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
