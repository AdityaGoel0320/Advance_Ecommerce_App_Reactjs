import Container from "../ui/Container";
import Registration from "../ui/profile/Registration";
import UserProfile from "../ui/profile/UserProfile";
import { store } from "../lib/store";
import Loading from "../ui/Loading";

const Profile = () => {
  const { currentUser, isLoading } = store();
  return (
    <Container>
      {currentUser ? (
        <UserProfile currentUser={currentUser} />
      ) : (
        <Registration />
      )}
      {/* <Registration /> */}
      {isLoading && <Loading />}
    </Container>
  );
};

export default Profile;
