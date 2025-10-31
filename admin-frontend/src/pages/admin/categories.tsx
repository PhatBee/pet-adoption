"use client";
import React, { useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  setCategoryQuery 
} from '../../store/slices/adminCategorySlice';
import PetCateForm from '../../components/petcate/PetCateForm';
import { QueryDto, CreateDto } from '../../types/petCate.dto';

const CategoryManagementPage = () => {
  const dispatch = useAppDispatch();
  const { items, pagination, loading, query } = useAppSelector(state => state.adminCategories);

  const fetchItemsCallback = useCallback((q: QueryDto) => {
    dispatch(fetchCategories(q));
  }, [dispatch]);

  const createItemCallback = useCallback((dto: CreateDto) => {
    dispatch(createCategory(dto));
  }, [dispatch]);

  const updateItemCallback = useCallback(({ id, dto }: { id: string, dto: CreateDto }) => {
    dispatch(updateCategory({ id, dto }));
  }, [dispatch]);

  const deleteItemCallback = useCallback((id: string) => {
    dispatch(deleteCategory(id));
  }, [dispatch]);

  const setQueryCallback = useCallback((q: Partial<QueryDto>) => {
    dispatch(setCategoryQuery(q));
  }, [dispatch]);

  return (
    <PetCateForm
      title="Quản lý Thể loại"
      items={items}
      pagination={pagination}
      loading={loading}
      query={query}
      fetchItems={fetchItemsCallback}
      createItem={createItemCallback}
      updateItem={updateItemCallback}
      deleteItem={deleteItemCallback}
      setQuery={setQueryCallback}
    />
  );
};

CategoryManagementPage.getLayout = function getLayout(page: React.ReactElement) {
    return (
        <AdminLayout>{page}</AdminLayout>
    );
};

export default CategoryManagementPage;