package edu.unimag.pulsepass.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "artists")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stage_name", nullable = false, unique = true)
    private String stageName;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String genre;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToMany(mappedBy = "artists")
    @Builder.Default
    private Set<Event> events = new HashSet<>();
}