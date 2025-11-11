import instance from "../setup/axios";

const getInfoParent = async () => {
    return instance.get(`parents/`);
    // const parentInfo = {
    //     id: 'PH001',
    //     name: 'Bà Nguyễn Thị Lan',
    //     avatar: 'NTL',
    //     children: [
    //       {
    //         id: 'HS001',
    //         name: 'Nguyễn Minh Anh',
    //         class: '10A1',
    //         school: 'THPT Nguyễn Du',
    //         route: 'Tuyến 1',
    //         vehicle: '29A-12345',
    //         driver: 'Nguyễn Văn Minh'
    //       }
    //     ]
    //   };
}
const getInfoStudent = async () => {
    return instance.get(`students/`);
}




export { getInfoParent, getInfoStudent };