import moment from 'moment';

const formatDate = (date: string | number) => {
  if (!date) {
    return '';
  }
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

export default formatDate;
