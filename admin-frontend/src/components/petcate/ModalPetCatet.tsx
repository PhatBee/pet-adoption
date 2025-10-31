"use client";
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '../common/FormInput';
import Modal from '../common/Modal';

const formSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
});
type FormSchema = z.infer<typeof formSchema>;

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormSchema) => void;
  defaultName?: string;
  isLoading: boolean;
  title: string;
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen, onClose, onSubmit, defaultName, isLoading, title
}) => {
  const methods = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: defaultName || '' },
  });

  useEffect(() => {
    methods.reset({ name: defaultName || '' });
  }, [defaultName, methods]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Tên"
            name="name"
            required
            placeholder="Nhập tên..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EntityFormModal;