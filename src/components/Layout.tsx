import { useAuthContext } from "../contexts/AuthContext"
import NavbarVisitor from "./Navbar";
import NavbarUser from "./NavbarUser";
import NavbarProvider from "./NavbarProvider";


type LayoutProps = {
    children: React.ReactNode;
};

function Layout ({ children}: LayoutProps) {
    const {role} = useAuthContext();

    let navbar;
    if(!role) {
        navbar = <NavbarVisitor />;
    } else if (role === "client") {
        navbar = <NavbarUser />;
    } else if (role === "provider") {
        navbar = <NavbarProvider />;
    }

    return (
        <div>
            {navbar}
            <main>{children}</main>
        </div>
    );
}

export default Layout;