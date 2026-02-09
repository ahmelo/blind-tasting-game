"""Create wine table with new schema

Revision ID: 001
Revises: 
Create Date: 2026-02-09 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.exc import ProgrammingError

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Verifica se a tabela 'wine' já existe; se não, cria
    inspector = sa.inspect(op.get_bind())
    if 'wine' not in inspector.get_table_names():
        # Criar enum country se não existir
        try:
            op.execute("""
                CREATE TYPE country_enum AS ENUM (
                    'aland_islands', 'afghanistan', 'albania', 'algeria', 'andorra', 'angola', 'antigua_and_barbuda', 'argentina', 'armenia', 'aruba', 'australia', 'austria', 'azerbaijan', 'bahamas', 'bahrain', 'bangladesh', 'barbados', 'belarus', 'belgium', 'belize', 'benin', 'bermuda', 'bhutan', 'bolivia', 'bosnia_and_herzegovina', 'botswana', 'brazil', 'british_ocean_territory', 'brunei', 'bulgaria', 'burkina_faso', 'burundi', 'cambodia', 'cameroon', 'canada', 'cape_verde', 'cayman_islands', 'central_african_republic', 'chad', 'chile', 'china', 'christmas_island', 'coconut_islands', 'colombia', 'comoros', 'congo', 'cook_islands', 'costa_rica', 'cote_divoire', 'croatia', 'cuba', 'curacao', 'cyprus', 'czech_republic', 'czechoslovakia', 'denmark', 'djibouti', 'dominica', 'dominican_republic', 'east_germany', 'east_timor', 'ecuador', 'egypt', 'el_salvador', 'england', 'equatorial_guinea', 'eritrea', 'estonia', 'eswatini', 'ethiopia', 'falkland_islands', 'faroe_islands', 'fiji', 'finland', 'france', 'french_guiana', 'french_polynesia', 'french_southern_territories', 'gabon', 'gambia', 'georgia', 'germany', 'ghana', 'gibraltar', 'greece', 'greenland', 'grenada', 'guadeloupe', 'guam', 'guatemala', 'guernsey', 'guinea', 'guinea_bissau', 'guyana', 'haiti', 'honduras', 'hong_kong', 'hungary', 'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland', 'isle_of_man', 'israel', 'italy', 'jamaica', 'japan', 'jersey', 'jordan', 'kazakhstan', 'kenya', 'kiribati', 'korea', 'kosovo', 'kuwait', 'kyrgyzstan', 'laos', 'latvia', 'lebanon', 'lesotho', 'liberia', 'libya', 'liechtenstein', 'lithuania', 'luxembourg', 'macao', 'madagascar', 'malawi', 'malaysia', 'maldives', 'mali', 'malta', 'marshall_islands', 'martinique', 'mauritania', 'mauritius', 'mayotte', 'mexico', 'micronesia', 'moldova', 'monaco', 'mongolia', 'montenegro', 'montserrat', 'morocco', 'mozambique', 'myanmar', 'namibia', 'nauru', 'nepal', 'netherlands', 'new_caledonia', 'new_zealand', 'nicaragua', 'niger', 'nigeria', 'niue', 'norfolk_island', 'north_korea', 'north_macedonia', 'northern_ireland', 'northern_mariana_islands', 'norway', 'oman', 'pakistan', 'palau', 'palestine', 'panama', 'papua_new_guinea', 'paraguay', 'peru', 'philippines', 'pitcairn_islands', 'poland', 'portugal', 'puerto_rico', 'qatar', 'reunion', 'romania', 'russia', 'rwanda', 'saint_barthelemy', 'saint_helena', 'saint_kitts_and_nevis', 'saint_lucia', 'saint_martin', 'saint_pierre_and_miquelon', 'saint_vincent_and_the_grenadines', 'samoa', 'san_marino', 'sao_tome_and_principe', 'saudi_arabia', 'scotland', 'senegal', 'serbia', 'seychelles', 'sierra_leone', 'singapore', 'sint_maarten', 'slovakia', 'slovenia', 'solomon_islands', 'somalia', 'south_africa', 'south_korea', 'south_sudan', 'soviet_union', 'spain', 'sri_lanka', 'sudan', 'suriname', 'svalbard_and_jan_mayen', 'sweden', 'switzerland', 'syria', 'taiwan', 'tajikistan', 'tanzania', 'thailand', 'timor_leste', 'togo', 'tokelau', 'tonga', 'trinidad_and_tobago', 'tunisia', 'turkey', 'turkmenistan', 'turks_and_caicos_islands', 'tuvalu', 'uganda', 'ukraine', 'united_arab_emirates', 'united_kingdom', 'united_states', 'united_states_minor_outlying_islands', 'united_states_virgin_islands', 'uruguay', 'uzbekistan', 'vanuatu', 'vatican_city', 'venezuela', 'vietnam', 'wales', 'wallis_and_futuna', 'western_sahara', 'yemen', 'yugoslavia', 'zambia', 'zimbabwe'
                )
            """)
        except ProgrammingError as e:
            # Se o tipo já existe, ignora o erro
            if 'already exists' not in str(e):
                raise
        
        # Criar tabela wine usando SQL raw para evitar conflitos com SQLAlchemy na criação do ENUM
        op.execute("""
            CREATE TABLE wine (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                round_id UUID NOT NULL UNIQUE,
                grapes TEXT[] NULL,
                country country_enum NULL,
                vintage INTEGER NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                FOREIGN KEY (round_id) REFERENCES rounds(id)
            )
        """)


def downgrade() -> None:
    op.drop_table('wine')
    op.execute('DROP TYPE country_enum')
