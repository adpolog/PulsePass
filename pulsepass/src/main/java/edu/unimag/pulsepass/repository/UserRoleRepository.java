
package edu.unimag.pulsepass.repository;

import edu.unimag.pulsepass.domain.Role;
import edu.unimag.pulsepass.domain.UserRole;
import edu.unimag.pulsepass.domain.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    @Query("SELECT r.id.role FROM UserRole r WHERE r.id.userId = :userId")
    List<Role> findRolesByUserId(@Param("userId") Long userId);
}
