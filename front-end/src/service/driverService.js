import instance from "../setup/axios";

const getInfoDriver = async (id) => {
    return instance.get(`drivers/${id}`);
}


export { getInfoDriver  };