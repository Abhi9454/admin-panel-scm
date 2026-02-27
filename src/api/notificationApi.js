import apiService from './apiService'

const notificationApi = {
  sendToStudents: (data) => apiService.post('/notifications/send/', data),
  sendToTeachers: (data) => apiService.post('/notifications/send-to-teachers/', data),
}

export default notificationApi
