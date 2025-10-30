import { z } from "zod";

export const numericField = (min?: number, msg?: string) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    min !== undefined ? z.number().min(min, msg) : z.number()
  );

export const formatToDateTimeLocal = (dateString?: string | Date): string => {
  const date = dateString ? new Date(dateString) : new Date();

  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  
  return localDate.toISOString().slice(0, 16);
};