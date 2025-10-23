import { useAuthContext } from "../contexts/AuthContext";
import NavbarVisitor from "./NavbarVisitor";
import NavbarUser from "./NavbarUser";
import NavbarProvider from "./NavbarProvider";

function NavbarHandler() {

    const { role } = useAuthContext();

    switch (role) {
        case "client":

        return<NavbarUser/>;

        case "provider":

        return <NavbarProvider/>;

        default: 
        return <NavbarVisitor/>
    };
}

export default NavbarHandler