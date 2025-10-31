"use client";
import React, { useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { 
  fetchPets, 
  createPet, 
  updatePet, 
  deletePet, 
  setPetQuery 
} from '../../store/slices/adminPetSlice';
import PetCateForm from '../../components/petcate/PetCateForm';
import { QueryDto, CreateDto } from '../../types/petCate.dto';

const PetManagementPage = () => {
  const dispatch = useAppDispatch();
  const { items, pagination, loading, query } = useAppSelector(state => state.adminPets); 

  const fetchItemsCallback = useCallback((q: QueryDto) => {
    dispatch(fetchPets(q));
  }, [dispatch]);

  const createItemCallback = useCallback((dto: CreateDto) => {
    dispatch(createPet(dto));
  }, [dispatch]);

  const updateItemCallback = useCallback(({ id, dto }: { id: string, dto: CreateDto }) => {
    dispatch(updatePet({ id, dto }));
  }, [dispatch]);

  const deleteItemCallback = useCallback((id: string) => {
    dispatch(deletePet(id));
  }, [dispatch]);

  const setQueryCallback = useCallback((q: Partial<QueryDto>) => {
    dispatch(setPetQuery(q));
  }, [dispatch]);

  return (
    <PetCateForm
      title="Quản lý Thú cưng"
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

PetManagementPage.getLayout = function getLayout(page: React.ReactElement) {
    return (
        <AdminLayout>{page}</AdminLayout>
    );
};

export default PetManagementPage;