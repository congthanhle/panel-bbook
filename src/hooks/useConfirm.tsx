import { Modal } from 'antd';
import { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  content: ReactNode;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

export const useConfirm = () => {
  const [modal, contextHolder] = Modal.useModal();

  const confirm = ({
    title,
    content,
    okText = 'Confirm',
    cancelText = 'Cancel',
    danger = false,
  }: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      modal.confirm({
        title: (
          <div className="flex items-center gap-2 text-lg">
            {danger && <AlertTriangle size={20} className="text-red-500" />}
            <span>{title}</span>
          </div>
        ),
        content: <div className="text-slate-500 mt-2">{content}</div>,
        okText,
        cancelText,
        okButtonProps: { 
          danger,
          className: danger ? '' : 'bg-indigo-600'
        },
        centered: true,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  return { confirm, contextHolder };
};
