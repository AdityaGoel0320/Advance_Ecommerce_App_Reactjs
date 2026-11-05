import Container from "../ui/Container";
import Registration from "../ui/profile/Registration";
import UserProfile from "../ui/profile/UserProfile";
import { store } from "../lib/store";
import Loading from "../ui/Loading";

const Profile = () => {
  const { currentUser, isLoading } = store();
  return (
    <Container>
      {isLoading ? <Loading label="Preparing your account..." /> : currentUser ? (
        <UserProfile currentUser={currentUser} />
      ) : (
        <Registration />
      )}
      {/* <Registration /> */}
    </Container>
  );
};

export default Profile;
