import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ProductForm from '../AdminProductForm';
import ProductView from './ProductView';
import productApi from '../../store/api/productApi';
import { Product } from '../../types/next';
import { toast } from 'react-toastify';

type ModalMode = 'create' | 'view' | 'edit';

interface ProductModalProps {
  isOpen: boolean;
  mode: ModalMode | null;
  productId: string | null;
  onClose: () => void;
  onSwitchToEdit: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  mode,
  productId,
  onClose,
  onSwitchToEdit,
}) => {
  const [productData, setProductData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productId && (mode === 'view' || mode === 'edit')) {
      const fetchDetail = async () => {
        setIsLoading(true);
        try {
          const data = await productApi.getProductById(productId);
          setProductData(data);
        } catch (error) {
          toast.error('Không thể tải sản phẩm.');
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    } else if (mode === 'create') {
      setProductData(null);
    }
  }, [isOpen, productId, mode, onClose]);

  if (!isOpen || !mode) return null;

  const title = mode === 'create'
    ? 'Thêm Sản Phẩm Mới'
    : isLoading
    ? 'Đang tải...'
    : productData
    ? mode === 'view'
      ? `Chi tiết: ${productData.name}`
      : `Sửa: ${productData.name}`
    : '';

  const content = (() => {
    if (mode === 'create') {
      return <ProductForm isEditMode={false} onSuccess={onClose} />;
    }
    if (isLoading) {
      return <p className="text-center text-indigo-600 py-8">Đang tải dữ liệu...</p>;
    }
    if (!productData) return null;

    return mode === 'view' ? (
      <ProductView product={productData} onSwitchToEdit={onSwitchToEdit} />
    ) : (
      <ProductForm
        isEditMode={true}
        productId={productId!}
        initialProduct={productData}
        onSuccess={onClose}
      />
    );
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={mode === 'create' || mode === 'edit' ? 'max' : 'max'}
    >
      {content}
    </Modal>
  );
};

export default ProductModal;