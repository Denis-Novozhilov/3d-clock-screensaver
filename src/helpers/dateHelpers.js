import { MONTHS } from './constants';

export const formatDate = (date) => (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
export const formatHours = (date) =>
	date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
export const formatMinutes = (date) =>
	date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
export const formatSeconds = (date) =>
	date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
export const formatMonths = (date) => MONTHS[date.getMonth()];
export const formatYear = (date) => date.getFullYear();
