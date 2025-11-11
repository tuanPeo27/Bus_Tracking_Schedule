import instance from "../setup/axios";

const getInfoDriver = async () => {
    return instance.get(`drivers/`);
}




export { getInfoDriver };