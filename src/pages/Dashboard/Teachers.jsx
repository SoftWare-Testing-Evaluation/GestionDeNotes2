import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard/teachers.css";

import { useAlert } from 'react-alert-with-buttons'
import { DeleteOutline, EditOutlined, Logout, Person2Outlined, RefreshOutlined } from "@mui/icons-material";

import { Skeleton, Tooltip } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Typography from "../../components/Typography/Typography.jsx";
import Pagination from "../../components/Pagination/Pagination.jsx";
import Button from "../../components/Button/Button.jsx";
import TeacherForm from '../../components/Forms/TeacherForm.jsx'
import {  teacher } from "../../assets/lordicons/index.js";
import  ModalContainer from "../../components/ModalContainer.jsx";
import DashboardHeader from "../../containers/DashboardHeader/DashboardHeader.jsx";
import {useDispatch,useSelector}from 'react-redux';
import { loadEnseignants, deleteEnseignant, updateEnseignant, createEnseignant} from '../../slices/enseignantSlice'; // Assurez-vous d'importer le thunk

const Teachers = () => {
    //State for translation
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { user, token } = useSelector((state) => state.auth); // Récupérer les informations de l'utilisateur et le token
    const enseignants = useSelector((state) => state.enseignants.enseignants); // Récupérer la liste des enseignants
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLogingOut, setIsLogingOut] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        dispatch(loadEnseignants()); // Charger les enseignants au montage du composant
    }, [dispatch]);

   
   
    const alert = useAlert()

    async function deleteAdmin(id) {
        setIsRefreshing(true);
        // Dispatch the delete action
        await dispatch(deleteEnseignant(id));
        setIsRefreshing(false);
    }
    const handleEdit = (enseignant) => {
        setSelectedTeacher(enseignant);
    };

    const handleLogout = () => {
        setIsLogingOut(true);
        // Simulez une opération de déconnexion
        setTimeout(() => {
            localStorage.removeItem('token'); // Supprimez le token d'authentification
            navigate('/'); // Redirigez vers la page de connexion
        }, 1000);
    };
    const handleTeacherSubmit = async (data) => {
        if (selectedTeacher) {
            await dispatch(updateEnseignant({ id: selectedTeacher.id, enseignantData: data }));
        } else {
            await dispatch(createEnseignant(data));
        }
        setSelectedTeacher(null);
        dispatch(loadEnseignants());
        setIsModalOpen(false); // Fermer le modal après soumission
    };

    function TeacherRow({ id, nom, prenom, email, specialite, grade}) {
        return (
            <tr>
                <td>{nom}</td>
                <td>{prenom}</td>
                <td>{email}</td>
                <td>{specialite}</td>
                <td>{grade}</td>
                <td className="option-buttons option  py-2 ">
                <EditOutlined 
                        className="bg-emerald-300 text-emerald-800 rounded-full p-2 hover:bg-emerald-400 hover:text-white cursor-pointer" 
                        onClick={() => handleEdit({ id, nom, prenom, email, specialite, grade })} 
                    /> 
                    <DeleteOutline className="bg-red-300 text-red-800 rounded-full p-2 hover:bg-red-400 hover:text-white !w-[35px] !h-[35px] ease-in-out duration-300 hover:scale-110 cursor-pointer ml-2" onClick={() =>
                        alert.open({
                            message: `Really delete, ${nom} ${prenom} ?`,
                            buttons: [
                                {
                                    label: "Yes",
                                    onClick: () => {
                                        deleteAdmin(id);
                                        alert.close()
                                    },
                                    style: {
                                        backgroundColor: "#990000",
                                        marginRight: "1rem",
                                        color: "white",
                                    },
                                },
                                {
                                    label: "No",
                                    onClick: () => {
                                        alert.close()
                                    },
                                },
                            ],
                        })} />
                </td>
            </tr>
        );
    }

    // useEffect(() => {
    //   if (admin === null || admin.role !== 'ADMIN')
    //     navigate('/signin')
    //   else {
    //     refresh(dispatch)
    //   }
    // }, [admin])

    return (
        <div className="teachers" >
            <div className="container">
                <DashboardHeader admin={user ? user.nom : 'Administrateur'}  handleLogout={handleLogout} isLogingOut={isLogingOut} isRefreshing={isRefreshing} icon={teacher} title={'Enseignants'} count={enseignants.length} />

                <div className="actions">
                    <ModalContainer triggerText={'Nouveau'} formToDisplay={<TeacherForm teacher={selectedTeacher} onSubmit={handleTeacherSubmit}/>} />
                    <Button text={"Rafraishir"} margin='0 1rem' bg='black' icon={<RefreshOutlined />} height='2.5rem' handler={() => dispatch(loadEnseignants())}  isLoading={isRefreshing} size={'25px'} />
                </div>

                <div className="data">
                    {
                        isRefreshing ?
                            <div>
                                <Skeleton variant="rectangular" width='100%' height={55} />
                                <div style={{ marginTop: '0.2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
                                    {
                                        Array.apply(null, { length: 25 }).map((value, index) =>
                                            <Skeleton key={index} variant="rounded" width={'98%'} height={40} style={{ margin: '0.125rem auto' }} />
                                        )
                                    }
                                </div>
                            </div> :
                            <div className="overflow-x-auto">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Prénom</th>
                                        <th>Email</th>
                                        <th>Spécialité</th>
                                        <th>Grade</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <Pagination data={enseignants} RenderComponent={TeacherRow} pageLimit={1} dataLimit={5} tablePagination={true} />
                                </tbody>
                            </table>
                            </div>
                    }
                </div>
                {selectedTeacher && (
                    <ModalContainer 
                        triggerText={'Modifier'} 
                        formToDisplay={<TeacherForm teacher={selectedTeacher} onSubmit={handleTeacherSubmit} />} 
                    />
                )}

            </div>
        </div>
    );
};

export default Teachers;
