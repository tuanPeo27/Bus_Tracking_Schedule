import instance from "../setup/axios";

const getInfoParent = async (idUser) => {
    return instance.get(`parents/`, { params: { id: idUser } });
};

const getInfoStudent = async (idUser) => {
    return instance.get(`students/`, { params: { parentId: idUser } });
};

export { getInfoParent, getInfoStudent };
